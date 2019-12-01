export class RaspistillInterruptError extends Error {
    constructor() {
        super('Action interrupted by user');

        this.name = 'RaspistillInterruptError';
    }
}