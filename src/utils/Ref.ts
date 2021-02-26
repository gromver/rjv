import {
  Path, Route, IStorage, IRef,
} from '../types';
import utils from './index';

export default class Ref implements IRef {
  readonly route: Route;

  /**
   * Create Ref
   * @param dataStorage
   * @param path - should be absolute
   */
  constructor (private readonly dataStorage: IStorage, public readonly path: Path = '/') {
    // todo check if path is absolute
    this.route = utils.pathToRoute(path);
  }

  get storage (): IStorage {
    return this.dataStorage;
  }

  getValue (): any {
    return this.storage.get(this.route);
  }

  setValue (value: any) {
    this.storage.set(this.route, value);
  }

  get value (): any {
    return this.getValue();
  }

  set value (value: any) {
    this.setValue(value);
  }

  ref (relPath: Path): Ref {
    return new Ref(this.storage, utils.resolvePath(relPath, this.path));
  }
}
