import type { DepType, RawDep, ResolvedDepChange } from '../types'

export function getByPath(obj: any, path: string) {
  return path.split('.').reduce((o, i) => o?.[i], obj)
}

export function setByPath(obj: any, path: string, value: any) {
  const keys = path.split('.')
  const lastKey = keys.pop() as string
  const target = keys.reduce((o, i) => o[i] = o[i] || {}, obj)
  target[lastKey] = value
}

export function parseDependencies(pkg: any, type: DepType, shouldUpdate: (name: string) => boolean): RawDep[] {
  return Object.entries(getByPath(pkg, type) || {}).map(([name, version]) => parseDependency(name, version as string, type, shouldUpdate))
}

export function parseDependency(name: string, version: string, type: DepType, shouldUpdate: (name: string) => boolean): RawDep {
  return {
    name,
    currentVersion: version,
    source: type,
    // when `updated` marked to `false`, it will be bypassed on resolving
    update: shouldUpdate(name),
  }
}

export function dumpDependencies(deps: ResolvedDepChange[], type: DepType) {
  const data: Record<string, string> = {}
  deps
    .filter(i => i.source === type)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((i) => {
      const version = i.update ? i.targetVersion : i.currentVersion
      if (i.aliasName === undefined)
        data[i.name] = version
      else
        data[i.aliasName] = `npm:${i.name}${version ? `@${version}` : ''}`
    })

  return data
}
