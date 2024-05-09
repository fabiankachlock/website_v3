import { getCollection } from 'astro:content';
import type { ProjectEntry } from './config';

export type LocalizedProject = Record<string, ProjectEntry>;

export type ProjectLink = {
  title: Record<string, string>;
  url: string;
};

export const extractSlug = (slug: string) => {
  const parts = slug.split('/');
  return {
    lang: parts[0],
    id: parts[1],
  };
};

export const getProjects = async (language: string): Promise<ProjectEntry[]> => {
  const allProjects = await getCollection('projects');
  const localizedProjects: Record<string, ProjectEntry> = {};

  for (const project of allProjects) {
    const data = extractSlug(project.slug);
    if (!data.id || !data.lang) continue;

    if (!localizedProjects[data.id]?.slug.startsWith(language)) {
      localizedProjects[data.id] = project;
    }
  }

  return Object.values(localizedProjects).toSorted((a, b) => {
    const orderA = a?.data.order ?? Infinity;
    const orderB = b?.data.order ?? Infinity;
    return orderA - orderB;
  });
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

export const getProjectLinks = async (): Promise<ProjectLink[]> => {
  const allProjects = await getCollection('projects');
  const links: Record<string, ProjectLink & { order: number }> = {};
  for (const project of allProjects) {
    const data = extractSlug(project.slug);
    if (!data.id || !data.lang) continue;
    if (data.id in links) {
      links[data.id]!.title[data.lang] = project.data.title;
    } else {
      links[data.id] = {
        title: {
          [data.lang]: project.data.title,
        },
        url: data.id,
        order: project.data.order,
      };
    }
  }

  return Object.values(links).toSorted((a, b) => a.order - b.order);
};
