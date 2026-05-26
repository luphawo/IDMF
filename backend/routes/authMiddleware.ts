import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        email: string;
        name: string;
        role: string;
        unit: string;
    };
}

export const mockAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Read user role details from headers or fall back to defaults
    // This allows the frontend to easily switch roles on-the-fly for simulation!
    const roleHeader = req.headers['x-role'] as string || 'Initiative Requester';
    const emailHeader = req.headers['x-email'] as string || 'jane.doe@unisa.ac.za';
    const nameHeader = req.headers['x-name'] as string || 'Jane Doe';
    const unitHeader = req.headers['x-unit'] as string || 'Academic Affairs';

    req.user = {
        role: roleHeader,
        email: emailHeader,
        name: nameHeader,
        unit: unitHeader
    };

    next();
};
