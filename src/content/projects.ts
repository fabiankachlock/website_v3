import { getCollection } from 'astro:content';
/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { localizePath } from 'astro-i18next';

import type { ProjectEntry } from './config';

export type LocalizedProject = Record<string, ProjectEntry>;

/**
 * A ProjectLink is a translated link to a project.
 */
export type ProjectLink = {
  slug: string;
  title: string;
  url: string;
};

/**
 * ProjectData is a collection of all projects with their links and resources.
 */
export type ProjectData = {
  projects: {
    id: string;
    year: string;
    order: number;
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

/**
 * Translates a project slug to a localized project link.
 *
 * @param slug the project slug
 * @returns the translated project link
 */
export const translateProjectLink = (slug: string) => {
  const slugData = extractSlug(slug);
  const link = localizePath(`/projekte/[projectSlug]`, slugData.lang).replace('[projectSlug]', slugData.id);
  return link;
};

/**
 * Extracts the language and id from a project slug.
 *
 * @param slug the project slug
 * @returns the language and id
 */
export const extractSlug = (slug: string) => {
  const parts = slug.split('/');
  return {
    lang: parts[0],
    id: parts[1],
  };
};

/**
 * Returns the localized entry for a language or the default entry.
 *
 * @param map the localized entries
 * @param language the language
 * @returns the localized entry or the default entry
 */
export const getLocalizedEntryOrDefault = <T>(map: Record<string, T>, language: string): T | undefined => {
  return map[language] ?? Object.values(map)[0];
};

/**
 * Collects all projects into a localized map.
 *
 * @returns the localized projects
 */
export const getLocalizedProjects = async (): Promise<Record<string, LocalizedProject>> => {
  const allProjects = await getCollection('projects');
  const localizedProjects: Record<string, LocalizedProject> = {};

  for (const project of allProjects) {
    if (project.data.disabled) continue;

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

/**
 * Compares two projects by their order to sort them ascending.
 *
 * @param a the first project
 * @param b the second project
 * @returns the comparison result
 */
export const compareProjects = (a?: ProjectEntry, b?: ProjectEntry): number => {
  return compareOrders(a?.data, b?.data);
};

/**
 * Compares two objects by their order to sort them in ascending order.
 *
 * @param a the first object
 * @param b the second object
 * @returns the comparison result
 */
export const compareOrders = <T extends { order?: number }>(a?: T, b?: T) => (b?.order ?? 0) - (a?.order ?? 0);

/**
 * Returns all projects sorted by their order.
 *
 * @param language the language
 * @returns the sorted projects
 */
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

/**
 * Returns a list of preview projects sorted by their order.
 *
 * @returns a list of preview projects
 */
export const getPreviewProjects = async (): Promise<LocalizedProject[]> => {
  const localizedProjects = await getLocalizedProjects();

  return Object.values(localizedProjects).toSorted((a, b) =>
    compareProjects(getLocalizedEntryOrDefault(a, ''), getLocalizedEntryOrDefault(b, '')),
  );
};

/**
 * Returns a list of links to all projects.
 *
 * @param language the current ui language
 * @returns a list of project links
 */
export const getProjectLinks = async (language: string): Promise<ProjectLink[]> => {
  const localizedProjects = await getLocalizedProjects();
  const links: (ProjectLink & { order: number })[] = [];

  for (const projectId in localizedProjects) {
    const project = getLocalizedEntryOrDefault(localizedProjects[projectId]!, language);
    if (!project) continue;

    const data = extractSlug(project.slug);
    if (!data.id || !data.lang) continue;
    links.push({
      title: project.data.title,
      slug: project.slug,
      url: translateProjectLink(project.slug),
      order: project.data.order,
    });
  }

  return links.toSorted(compareOrders);
};

/**
 * Returns a list of links to all projects that are referenced by the given project.
 *
 * @param seeAlso the see also references of the project
 * @param language the current ui language
 * @returns a list of project links
 */
export const getSeeAlsoLinks = async (seeAlso: string[], language: string): Promise<ProjectLink[]> => {
  if (!seeAlso || seeAlso.length === 0) return [];

  const allLinks = await getProjectLinks(language);
  return allLinks.filter(link => {
    const slugData = extractSlug(link.slug);
    return slugData.id && seeAlso.includes(slugData.id);
  });
};

/**
 * Returns the project overview with all projects and their links.
 *
 * @param language the current ui language
 * @returns the project overview
 */
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
      order: entry.data.order,
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

  data.projects ? data.projects.toSorted(compareOrders) : [];
  return data;
};
