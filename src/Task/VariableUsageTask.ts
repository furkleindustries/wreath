import {
  AbstractTask,
} from './AbstractTask';
import {
  INodeLike,
} from '../NodeLike/INodeLike';
import {
  isIElementLike,
} from '../TypeGuards/isIElementLike';
import {
  TIndexableObject,
} from '../TypeAliases/TIndexableObject';

export class VariableUsageTask extends AbstractTask {
  executeMicrotask: Function = (
    node:        INodeLike,
    passageName: string,
    format:      string,
    version:     string,
    options:     Array<any> = [],
  ): void => {
    /* Get rid of VS not-used errors. */format;version;options;
    if (isIElementLike(node)) {
      const tagName = node.tagName.toLowerCase();
      let accumulator = this.accumulator;
      const dataName = node.getAttribute('data-name');
      const lineNumber = node.getAttribute('data-line-number');
      const columnNumber = node.getAttribute('data-column-number');
      if (tagName === 'tw-invocation' && dataName === 'set') {
        const elem = node.firstElementChild || <TIndexableObject>{};
        const variableName = elem.getAttribute('data-name');
        if (!variableName) {
          throw new Error('A variable was detected without a data-name ' +
                          'attribute.');
        }

        accumulator = <TIndexableObject>accumulator;
        if (passageName in this.accumulator) {
          if (variableName in accumulator[passageName]) {
            accumulator[passageName].defines[variableName].push({
              lineNumber,
              columnNumber,
            });
          } else {
            accumulator[passageName].defines[variableName] = [
              {
                lineNumber,
                columnNumber,
              },
            ];
          }
        } else {
          accumulator[passageName] = {
            defines: {
              [variableName]: [
                {
                  lineNumber,
                  columnNumber,
                },
              ],
            },

            usages: {},
          };
        }
      } else if (tagName === 'tw-variable') {
        const variableName = node.getAttribute('data-name');
        if (!variableName) {
          throw new Error('The data-name attribute in the tw-variable was ' +
                          'missing.');
        }

        /* Skip variables contained inside set statements. */
        if (node.parentElement &&
          node.parentElement.tagName.toLowerCase() === 'tw-invocation' &&
          node.nextElementSibling &&
          node.nextElementSibling.tagName.toLowerCase() === 'tw-string' &&
          (node.nextElementSibling.textContent === 'to' ||
          node.nextElementSibling.textContent === '='))
        {
          return;
        }

        accumulator = <TIndexableObject>accumulator;
        if (passageName in this.accumulator) {
          if (variableName in accumulator[passageName].usages) {
            accumulator[passageName].usages[variableName].push({
              lineNumber,
              columnNumber,
            });
          } else {
            accumulator[passageName].usages[variableName] = [
              {
                lineNumber,
                columnNumber,
              },
            ];
          }
        } else {
          accumulator[passageName] = {
            defines: {},
            usages: {
              [variableName]: [
                {
                  lineNumber,
                  columnNumber,
                },
              ],
            },
          };
        }
      }
    }
  }
}

export default VariableUsageTask;