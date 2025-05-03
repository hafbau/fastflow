declare module '../middleware/auth' {
    import { Request, Response, NextFunction } from 'express'
    export const authenticateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>
}

declare module '../middleware/validator' {
    import { Request, Response, NextFunction } from 'express'
    export const validateRequestBody: (requiredFields: string[]) => (req: Request, res: Response, next: NextFunction) => void
    export const validateQueryParams: (requiredParams: string[]) => (req: Request, res: Response, next: NextFunction) => void
    export const validatePathParams: (requiredParams: string[]) => (req: Request, res: Response, next: NextFunction) => void
}