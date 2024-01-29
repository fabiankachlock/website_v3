import { getCollection } from 'astro:content';
import type { ProjectEntry } from './config';

export type LocalizedProject = Record<string, ProjectEntry>;

const extractSlug = (slug: string) => {
  const parts = slug.split('/');
  return {
    lang: parts[0],
    id: parts[1],
  };
};

export const getPreviewProjects = async (): Promise<LocalizedProject[]> => {
  const allProjects = await getCollection('projects');
  const localizedProjects: Record<string, LocalizedProject> = {};
  for (const project of allProjects) {
    const data = extractSlug(project.slug);
    if (!data.id || !data.lang) continue;
    if (data.id in localizedProjects) {
      localizedProjects[data.id]![data.lang] = project;
    } else {
      localizedProjects[data.id] = {
        [data.lang]: project,
      };
    }
  }
  return Object.values(localizedProjects).toSorted((a, b) => {
    const orderA = a[Object.keys(a)[0]!]?.data.order ?? Infinity;
    const orderB = b[Object.keys(b)[0]!]?.data.order ?? Infinity;
    return orderA - orderB;
  });
};
