import { redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';
import * as _ from 'radashi';

import { prisma } from '$utils/prisma';

import type { Prisma } from '$utils/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { userId } = event.locals.auth();
	if (!userId) {
		redirect(307, '/');
	}

	event.depends('dashboard');

	const start = getDate(event.url, 'start');
	const end = getDate(event.url, 'end');
	const project = event.url.searchParams.get('project');

	const [projects, entries] = await Promise.all([
		getProjects(),
		getEntries(userId, start, end, project)
	]);

	return {
		start,
		end,
		projects,
		entries
	};
};

function getDate(url: URL, name: 'start' | 'end'): Date {
	const dateString = url.searchParams.get(name);
	if (dateString) {
		return new Date(dateString);
	}
	return {
		start: dayjs().startOf('month').toDate(),
		end: dayjs().endOf('month').toDate()
	}[name];
}

async function getProjects() {
	const resp = await prisma.entry.findMany({
		where: {
			project: {
				not: null
			}
		},
		distinct: ['project'],
		select: {
			project: true
		}
	});
	return _.sift(resp.map((p) => p.project));
}

async function getEntries(userId: string, start: Date, end: Date, project: string | null) {
	const where: Prisma.EntryWhereInput = {
		user: {
			equals: userId
		},
		date: {
			gte: start,
			lte: end
		}
	};
	if (project) {
		where.project = {
			equals: project
		};
	}
	return await prisma.entry.findMany({
		where,
		orderBy: {
			date: 'desc'
		}
	});
}
