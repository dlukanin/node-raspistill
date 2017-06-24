export class RaspistillInterruptError extends Error {
    constructor() {
        super('Action interrupted by user');
        this.name = 'RaspistillInterruptError';

        // NOTE https://github.com/Microsoft/TypeScript-wiki/blob
        // /master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        (this as any).__proto__ = RaspistillInterruptError.prototype;
    }
}