import crypto from 'crypto';

export const load = async () => {
	console.log('loading');
	const info = generatePKCE();
	console.log(info);
	await sendMagicLink(info.challenge);
	//await oauth(info.challenge);
};

function generatePKCE() {
	const verifier = crypto.randomBytes(32).toString('base64');
	const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

	return { verifier, challenge };
}

async function sendMagicLink(challenge: string) {
	console.log('sending magic link');
	const email = 'hadem68305@infornma.com';
	const provider = 'builtin::local_magic_link';
	//const callback_url = 'http://localhost:5173';
	const callback_url = 'https://squid.thetinkerinc.com';
	const redirect_on_failure = callback_url;
	//const gelURL = 'http://localhost:10701/db/main/ext/auth/magic-link/register';
	//const gelURL = 'https://squid--thetinkerinc.c-09.i.aws.edgedb.cloud:5656/db/main/ext/auth/magic-link/register';
	const gelURL =
		'https://squid--thetinkerinc.c-09.i.aws.edgedb.cloud:5656/branch/main/ext/auth/magic-link/email';
	const resp = await fetch(gelURL, {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			challenge,
			email,
			provider,
			callback_url,
			redirect_on_failure
		})
	});
	console.log(resp);
	const json = await resp.json();
	console.log(json);
}

async function oauth(challenge: string) {
	const q = new URLSearchParams({
		provider: 'builtin::oauth_google',
		challenge,
		redirect_to: 'https://squid.thetinkerinc.com',
		redirect_to_on_signup: 'https://squid.thetinkerinc.com'
	});
	const gelURL =
		'https://squid--thetinkerinc.c-09.i.aws.edgedb.cloud:5656/db/main/ext/auth/authorize?' + q;
	const resp = await fetch(gelURL, {
		redirect: 'follow'
	});
	console.log(resp);
	if (resp.status === 500) {
		console.log(await resp.json());
	}
}
