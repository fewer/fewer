type Subset<T, V> = {
    [P in (keyof T & V)]: (T[P]);
};

type WhereType<T> = {
    [P in keyof T]?: T[P] | T[P][]
};

class Repository<RepoType> {
    private internalSlot: symbol;
    constructor(tableName: string) {
        this.internalSlot = Symbol(tableName);
    }

    // Converts from plain object into internal representation with the correct slot:
    from<T extends Partial<RepoType>>(obj: T): Subset<T, keyof RepoType> {
        return Object.assign({}, obj, {
            [this.internalSlot]: true,
        });
    }

    // TODO: Does this need to be a different return type vs `from`?
    create<T extends Partial<RepoType>>(obj: T): T & Partial<RepoType> {
        return this.from(obj) as T & Partial<RepoType>;
    }

    where(wheres: WhereType<RepoType>) {
        return null;
    }
}

export function createRepository<Type>(tableName: string) {
    return new Repository<Type>(tableName);
}
