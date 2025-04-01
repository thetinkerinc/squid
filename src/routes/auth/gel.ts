import http from 'node:http';
import { URL } from 'node:url';
import crypto from 'node:crypto';

/**
 * You can get this value by running `gel instance credentials`.
 * Value should be:
 * `${protocol}://${host}:${port}/branch/${branch}/ext/auth/
 */
const GEL_AUTH_BASE_URL = process.env.GEL_AUTH_BASE_URL;
const SERVER_PORT = 3000;

/**
 * Generate a random Base64 url-encoded string, and derive a "challenge"
 * string from that string to use as proof that the request for a token
 * later is made from the same user agent that made the original request
 *
 * @returns {Object} The verifier and challenge strings
 */
const generatePKCE = () => {
	const verifier = crypto.randomBytes(32).toString('base64url');

	const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

	return { verifier, challenge };
};

const server = http.createServer(async (req, res) => {
	const requestUrl = getRequestUrl(req);

	switch (requestUrl.pathname) {
		case '/auth/authorize': {
			await handleAuthorize(req, res);
			break;
		}

		case '/auth/callback': {
			await handleCallback(req, res);
			break;
		}

		default: {
			res.writeHead(404);
			res.end('Not found');
			break;
		}
	}
});

/**
 * Redirects OAuth requests to Gel Auth OAuth authorize redirect
 * with the PKCE challenge, and saves PKCE verifier in an HttpOnly
 * cookie for later retrieval.
 *
 * @param {Request} req
 * @param {Response} res
 */
const handleAuthorize = async (req, res) => {
	const requestUrl = getRequestUrl(req);
	const provider = requestUrl.searchParams.get('provider');

	if (!provider) {
		res.status = 400;
		res.end("Must provider a 'provider' value in search parameters");
		return;
	}

	const pkce = generatePKCE();
	const redirectUrl = new URL('authorize', GEL_AUTH_BASE_URL);
	redirectUrl.searchParams.set('provider', provider);
	redirectUrl.searchParams.set('challenge', pkce.challenge);
	redirectUrl.searchParams.set('redirect_to', `http://localhost:${SERVER_PORT}/auth/callback`);
	redirectUrl.searchParams.set(
		'redirect_to_on_signup',
		`http://localhost:${SERVER_PORT}/auth/callback?isSignUp=true`
	);

	res.writeHead(302, {
		'Set-Cookie': `gel-pkce-verifier=${pkce.verifier}; HttpOnly; Path=/; Secure; SameSite=Strict`,
		Location: redirectUrl.href
	});
	res.end();
};

/**
 * Handles the PKCE callback and exchanges the `code` and `verifier
 * for an auth_token, setting the auth_token as an HttpOnly cookie.
 *
 * @param {Request} req
 * @param {Response} res
 */
const handleCallback = async (req, res) => {
	const requestUrl = getRequestUrl(req);

	const code = requestUrl.searchParams.get('code');
	if (!code) {
		const error = requestUrl.searchParams.get('error');
		res.status = 400;
		res.end(`OAuth callback is missing 'code'. OAuth provider responded with error: ${error}`);
		return;
	}

	const cookies = req.headers.cookie?.split('; ');
	const verifier = cookies
		?.find((cookie) => cookie.startsWith('gel-pkce-verifier='))
		?.split('=')[1];
	if (!verifier) {
		res.status = 400;
		res.end(
			`Could not find 'verifier' in the cookie store. Is this the same user agent/browser that started the authorization flow?`
		);
		return;
	}

	const codeExchangeUrl = new URL('token', GEL_AUTH_BASE_URL);
	codeExchangeUrl.searchParams.set('code', code);
	codeExchangeUrl.searchParams.set('verifier', verifier);
	const codeExchangeResponse = await fetch(codeExchangeUrl.href, {
		method: 'GET'
	});

	if (!codeExchangeResponse.ok) {
		const text = await codeExchangeResponse.text();
		res.status = 400;
		res.end(`Error from the auth server: ${text}`);
		return;
	}

	const { auth_token } = await codeExchangeResponse.json();
	res.writeHead(204, {
		'Set-Cookie': `gel-auth-token=${auth_token}; HttpOnly; Path=/; Secure; SameSite=Strict`
	});
	res.end();
};
