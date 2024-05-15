import { getCollection } from 'astro:content';
import type { ProjectEntry } from './config';
import { localizePath } from 'astro-i18next';

export type LocalizedProject = Record<string, ProjectEntry>;

export type ProjectLink = {
  slug: string;
  title: string;
  url: string;
};

export type ProjectData = {
  projects: {
    id: string;
    year: string;
    title: string;
    description: string;
    links: Record<string, string>;
  }[];
  githubLinks: {
    title: string;
    url: string;
  }[];
  webLinks: {
    title: string;
    url: string;
  }[];
};

export const translateProjectLink = (slug: string) => {
  const slugData = extractSlug(slug);
  const link = localizePath(`/projekte/[projectSlug]`, slugData.lang).replace('[projectSlug]', slugData.id);
  return link;
};

export const extractSlug = (slug: string) => {
  const parts = slug.split('/');
  return {
    lang: parts[0],
    id: parts[1],
  };
};

export const getLocalizedEntryOrDefault = <T>(map: Record<string, T>, language: string): T | undefined => {
  return map[language] ?? Object.values(map)[0];
};

export const getLocalizedProjects = async (): Promise<Record<string, LocalizedProject>> => {
  const allProjects = await getCollection('projects');
  const localizedProjects: Record<string, LocalizedProject> = {};

  for (const project of allProjects) {
    if (!project.data.enabled) continue;

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

  return localizedProjects;
};

export const compareProjects = (a?: ProjectEntry, b?: ProjectEntry): number => {
  const orderA = a?.data.order ?? Infinity;
  const orderB = b?.data.order ?? Infinity;
  return orderA - orderB;
};

export const getProjects = async (language: string): Promise<ProjectEntry[]> => {
  const localizedProjects = await getLocalizedProjects();
  const allProjects: ProjectEntry[] = [];

  for (const projectId in localizedProjects) {
    const project = localizedProjects[projectId];

    if (project && language in project) {
      allProjects.push(project[language]!);
    } else if (project) {
      const fallback = Object.values(project)[0];
      if (fallback) allProjects.push(fallback);
    }
  }

  return allProjects.toSorted(compareProjects);
};

export const getPreviewProjects = async (): Promise<LocalizedProject[]> => {
  const localizedProjects = await getLocalizedProjects();

  return Object.values(localizedProjects).toSorted((a, b) =>
    compareProjects(getLocalizedEntryOrDefault(a, ''), getLocalizedEntryOrDefault(b, '')),
  );
};

export const getProjectLinks = async (language: string): Promise<ProjectLink[]> => {
  const localizedProjects = await getLocalizedProjects();
  const links: (ProjectLink & { order: number })[] = [];

  for (const projectId in localizedProjects) {
    const project = getLocalizedEntryOrDefault(localizedProjects[projectId]!, language);
    if (!project || !project.data.enabled) continue;

    const data = extractSlug(project.slug);
    if (!data.id || !data.lang) continue;
    links.push({
      title: project.data.title,
      slug: project.slug,
      url: translateProjectLink(project.slug),
      order: project.data.order,
    });
  }

  return links.toSorted((a, b) => a.order - b.order);
};

export const getSeeAlsoLinks = async (seeAlso: string[], language: string): Promise<ProjectLink[]> => {
  if (!seeAlso || seeAlso.length === 0) return [];

  const allLinks = await getProjectLinks(language);
  return allLinks.filter(link => {
    const slugData = extractSlug(link.slug);
    return slugData.id && seeAlso.includes(slugData.id);
  });
};

export const getProjectOverview = async (language: string): Promise<ProjectData> => {
  const localizedProjects = await getLocalizedProjects();
  const data: ProjectData = {
    projects: [],
    githubLinks: [],
    webLinks: [],
  };

  for (const projectId in localizedProjects) {
    const project = localizedProjects[projectId] ?? {};
    const entry = getLocalizedEntryOrDefault(project ?? {}, language);
    if (!entry) continue;
    data.projects.push({
      id: projectId,
      year: entry.data.year,
      title: entry.data.title,
      description: entry.data.description,
      links: Object.entries(project).reduce(
        (allLinks, [projectLang, entry]) => ({
          ...allLinks,
          [projectLang]: translateProjectLink(entry.slug),
        }),
        {} as Record<string, string>,
      ),
    });

    if (entry.data.socials?.github)
      data.githubLinks.push({
        title: entry.data.title,
        url: entry.data.socials?.github,
      });
    if (entry.data.socials?.web)
      data.webLinks.push({
        title: entry.data.title,
        url: entry.data.socials?.web,
      });
  }

  return data;
};
