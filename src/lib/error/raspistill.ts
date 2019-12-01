export class RaspistillDefaultError extends Error {
    public static readonly CODE_NO_PHOTO: string = 'NO_TAKEN_PHOTO_FOUND';
    public static readonly CODE_SPAWN_PROC_ERROR: string = 'SPAWN_PROC_ERROR';

    constructor(public readonly code: string, message?: string) {
        super('Raspistill failed, code: ' + code + ' message: ' + message);

        this.name = 'RaspistillDefaultError';
    }
}