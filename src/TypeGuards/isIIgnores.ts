import {
  NodeTypes,
} from '../constants';
import {
  IIgnores,
} from '../Ignores/IIgnores';
import {
  TIndexableObject,
} from '../TypeAliases/TIndexableObject';

export function isIIgnores(ignores: any): ignores is IIgnores {
  const nodeTypes = Object.values<number>(<TIndexableObject>NodeTypes);
  return ignores /* ignores is truthy. */ &&
    /* ignores is an object (and not null given the before). */
    typeof ignores === 'object' &&
    /* ignores.nodeTypes is an object. */
    typeof ignores.nodeTypes === 'object' &&
    /* ignores.nodeTypes has a length which is a number greater than or
     * equal to 0. */
    ignores.nodeTypes.length >= 0 &&
    /* ignores.nodeTypes.length is an integer. */
    ignores.nodeTypes.length % 1 === 0 &&
    /* ignores.nodeTypes.filter is a function. */
    typeof ignores.nodeTypes.filter === 'function' &&
    /* ignores.nodeTypes.forEach is a function. */
    typeof ignores.nodeTypes.forEach === 'function' &&
    /* ignores.nodeTypes.map is a function. */
    typeof ignores.nodeTypes.map === 'function' &&
    /* ignores.nodeTypes.reduce is a function. */
    typeof ignores.nodeTypes.reduce === 'function' &&
    /* None of the items in ignores.nodeTypes are outside the NodeTypes 
     * enum. */
    ignores.nodeTypes.filter((aa: number) => nodeTypes.indexOf(aa) === -1).length === 0 &&
    /* ignores.elementTags is truthy. */
    ignores.elementTags &&
    /* ignores.elementTags is an object (and not null given the before). */
    typeof ignores.elementTags === 'object' &&
    /* ignores.elementTags has a length which is a number greater than or
     * equal to 0. */
    ignores.elementTags.length % 1 === 0 &&
    /* ignores.elementTags.filter is a function. */
    typeof ignores.elementTags.filter === 'function' &&
    /* ignores.elementTags.forEach is a function. */
    typeof ignores.elementTags.forEach === 'function' &&
    /* ignores.elementTags.map is a function. */
    typeof ignores.elementTags.map === 'function' &&
    /* ignores.elementTags.reduce is a function. */
    typeof ignores.elementTags.reduce === 'function' &&
    /* All of the items in ignores.elementTags are strings with content. */
    ignores.elementTags.filter((aa: string) => aa && typeof aa === 'string').length === 0 &&
    /* ignores.passageNames is truthy. */
    ignores.passageNames &&
    /* ignores.passageNames is an object (and not null given the before). */
    typeof ignores.passageNames === 'object' &&
    /* ignores.passageNames has a length which is a number greater than or
     * equal to 0. */
    ignores.passageNames.length % 1 === 0 &&
    /* ignores.passageNames.filter is a function. */
    typeof ignores.passageNames.filter === 'function' &&
    /* ignores.passageNames.forEach is a function. */
    typeof ignores.passageNames.forEach === 'function' &&
    /* ignores.passageNames.map is a function. */
    typeof ignores.passageNames.map === 'function' &&
    /* ignores.passageNames.reduce is a function. */
    typeof ignores.passageNames.reduce === 'function' &&
    /* All of the items in ignores.passageNames are strings with content. */
    ignores.passageNames.filter((aa: string) => aa && typeof aa === 'string').length === 0 &&
    /* ignores.passageTags is truthy. */
    ignores.passageTags &&
    /* ignores.passageTags is an object (and not null given the before). */
    typeof ignores.passageTags === 'object' &&
    /* ignores.passageTags has a length which is a number greater than or
     * equal to 0. */
    ignores.passageTags.length % 1 === 0 &&
    /* ignores.passageTags.filter is a function. */
    typeof ignores.passageTags.filter === 'function' &&
    /* ignores.passageTags.forEach is a function. */
    typeof ignores.passageTags.forEach === 'function' &&
    /* ignores.passageTags.map is a function. */
    typeof ignores.passageTags.map === 'function' &&
    /* ignores.passageTags.reduce is a function. */
    typeof ignores.passageTags.reduce === 'function' &&
    /* All of the items in ignores.passageTags are strings with content. */
    ignores.passageTags.filter((aa: string) => aa && typeof aa === 'string').length === 0;
}

export default isIIgnores;