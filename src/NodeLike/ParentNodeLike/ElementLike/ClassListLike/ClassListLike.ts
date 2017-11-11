import {
  IClassListLike,
} from './IClassListLike';
import {
  IElementLike,
} from '../IElementLike';
import {
  List,
} from 'immutable';

export class ClassListLike implements IClassListLike {
  private __element: IElementLike;
  private __classes: List<string>;

  get length(): number {
    return this.__classes.count();
  }

  get value(): string {
    return this.__classes.join(' ');
  }

  constructor(element: IElementLike) {
    this.__element = element;
    this.__pullFromParent();
  }

  add(...classes: Array<string>): void {
    let updated = false;
    classes.forEach((cls:string) => {
      if (classes.indexOf(cls) === -1) {
        this.__classes = this.__classes.push(cls);
        updated = true;
      }
    });

    if (updated) {
      this.__pushToParent();
    }
  }

  remove(...classes: Array<string>): void {
    let updated: boolean = false;
    classes.forEach((cls: string) => {
      const index: number = this.__classes.indexOf(cls);
      if (index !== -1) {
        this.__classes = this.__classes.delete(index);
        updated = true;
      }
    });

    if (updated) {
      this.__pushToParent();
    }
  }

  item(index: number): string {
    return this.__classes.get(index) || '';
  }

  toggle(...classes: Array<string>): void {
    classes.forEach((cls: string) => {
      const index = this.__classes.indexOf(cls);
      if (index === -1) {
        this.__classes = this.__classes.delete(index);
      } else {
        this.__classes = this.__classes.push(cls);
      }
    });

    this.__pushToParent();
  }

  replace(oldClass: string, newClass: string): void {
    const index = this.__classes.indexOf(oldClass);
    if (index !== -1) {
      this.__classes = this.__classes.set(index, newClass);
      this.__pushToParent();
    }
  }

  contains(cls: string): boolean {
    return this.__classes.indexOf(cls) !== -1;
  }

  __pushToParent(): void {
    this.__element.setAttribute('class', this.value);
  }

  __pullFromParent(): void {
    const classes = this.__element.className
      /* Use the space as a delimiter. */
      .split(' ')
      /* Throw away all empty strings. */
      .filter((cls: string) => {
          return cls.length > 0;
      });

    /* Make the class list immutable. */
    this.__classes = List(classes);
  }
}

export default ClassListLike;