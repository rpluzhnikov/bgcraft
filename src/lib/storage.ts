/**
 * LocalStorage Persistence Utilities
 * Handles saving, loading, and managing projects in browser localStorage
 */

import type { Project } from '../types/index'

const STORAGE_PREFIX = 'linkedin-cover-gen'
const PROJECT_KEY = (id: string) => `${STORAGE_PREFIX}:project:${id}`
const PROJECT_LIST_KEY = `${STORAGE_PREFIX}:projects`
const AUTOSAVE_KEY = `${STORAGE_PREFIX}:autosave`

export interface ProjectMetadata {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  thumbnail?: string
}

/**
 * Save a project to localStorage
 * @param project - Project to save
 * @returns True if saved successfully
 */
export function saveProject(project: Project): boolean {
  try {
    const projectKey = PROJECT_KEY(project.id)

    // Save the full project data
    localStorage.setItem(projectKey, JSON.stringify(project))

    // Update the project list metadata
    updateProjectList(project)

    return true
  } catch (error) {
    console.error('Failed to save project:', error)
    return false
  }
}

/**
 * Load a project from localStorage
 * @param id - Project ID to load
 * @returns Project or null if not found
 */
export function loadProject(id: string): Project | null {
  try {
    const projectKey = PROJECT_KEY(id)
    const data = localStorage.getItem(projectKey)

    if (!data) {
      return null
    }

    return JSON.parse(data) as Project
  } catch (error) {
    console.error('Failed to load project:', error)
    return null
  }
}

/**
 * List all saved projects (metadata only)
 * @returns Array of project metadata sorted by updatedAt (newest first)
 */
export function listProjects(): ProjectMetadata[] {
  try {
    const data = localStorage.getItem(PROJECT_LIST_KEY)

    if (!data) {
      return []
    }

    const projects = JSON.parse(data) as ProjectMetadata[]

    // Sort by updatedAt descending (newest first)
    return projects.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error('Failed to list projects:', error)
    return []
  }
}

/**
 * Delete a project from localStorage
 * @param id - Project ID to delete
 * @returns True if deleted successfully
 */
export function deleteProject(id: string): boolean {
  try {
    const projectKey = PROJECT_KEY(id)

    // Remove the project data
    localStorage.removeItem(projectKey)

    // Update the project list
    const projects = listProjects().filter((p) => p.id !== id)
    localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(projects))

    return true
  } catch (error) {
    console.error('Failed to delete project:', error)
    return false
  }
}

/**
 * Update the project list with current project metadata
 * @param project - Project to update in list
 */
function updateProjectList(project: Project): void {
  try {
    const projects = listProjects()

    // Find existing project or add new
    const existingIndex = projects.findIndex((p) => p.id === project.id)

    const metadata: ProjectMetadata = {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }

    if (existingIndex >= 0) {
      projects[existingIndex] = metadata
    } else {
      projects.push(metadata)
    }

    localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(projects))
  } catch (error) {
    console.error('Failed to update project list:', error)
  }
}

/**
 * Save project to autosave slot
 * @param project - Project to autosave
 * @returns True if saved successfully
 */
export function autosaveProject(project: Project): boolean {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(project))
    return true
  } catch (error) {
    console.error('Failed to autosave project:', error)
    return false
  }
}

/**
 * Load project from autosave slot
 * @returns Autosaved project or null
 */
export function loadAutosave(): Project | null {
  try {
    const data = localStorage.getItem(AUTOSAVE_KEY)

    if (!data) {
      return null
    }

    return JSON.parse(data) as Project
  } catch (error) {
    console.error('Failed to load autosave:', error)
    return null
  }
}

/**
 * Clear autosave slot
 * @returns True if cleared successfully
 */
export function clearAutosave(): boolean {
  try {
    localStorage.removeItem(AUTOSAVE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear autosave:', error)
    return false
  }
}

/**
 * Check if localStorage is available and working
 * @returns True if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = `${STORAGE_PREFIX}:test`
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Get storage usage information
 * @returns Storage usage stats
 */
export function getStorageInfo(): {
  used: number
  available: number
  percentage: number
} {
  try {
    let used = 0

    // Calculate total size of all project data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key)
        if (value) {
          used += key.length + value.length
        }
      }
    }

    // Estimate available space (5MB typical limit)
    const estimated = 5 * 1024 * 1024
    const percentage = (used / estimated) * 100

    return {
      used,
      available: estimated - used,
      percentage: Math.min(percentage, 100),
    }
  } catch (error) {
    console.error('Failed to get storage info:', error)
    return { used: 0, available: 0, percentage: 0 }
  }
}

/**
 * Clear all projects (use with caution!)
 * @returns Number of projects cleared
 */
export function clearAllProjects(): number {
  try {
    const projects = listProjects()
    const count = projects.length

    // Remove all project data
    projects.forEach((project) => {
      localStorage.removeItem(PROJECT_KEY(project.id))
    })

    // Clear project list
    localStorage.removeItem(PROJECT_LIST_KEY)

    return count
  } catch (error) {
    console.error('Failed to clear all projects:', error)
    return 0
  }
}

/**
 * Export project as JSON string
 * @param project - Project to export
 * @returns JSON string
 */
export function exportProjectAsJson(project: Project): string {
  return JSON.stringify(project, null, 2)
}

/**
 * Import project from JSON string
 * @param json - JSON string to import
 * @returns Parsed project or null if invalid
 */
export function importProjectFromJson(json: string): Project | null {
  try {
    const project = JSON.parse(json) as Project

    // Validate basic structure
    if (
      !project.id ||
      !project.name ||
      !project.layers ||
      !Array.isArray(project.layers)
    ) {
      throw new Error('Invalid project structure')
    }

    return project
  } catch (error) {
    console.error('Failed to import project:', error)
    return null
  }
}
