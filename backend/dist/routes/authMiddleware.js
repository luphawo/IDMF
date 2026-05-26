"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAuthMiddleware = void 0;
const mockAuthMiddleware = (req, res, next) => {
    // Read user role details from headers or fall back to defaults
    // This allows the frontend to easily switch roles on-the-fly for simulation!
    const roleHeader = req.headers['x-role'] || 'Initiative Requester';
    const emailHeader = req.headers['x-email'] || 'jane.doe@unisa.ac.za';
    const nameHeader = req.headers['x-name'] || 'Jane Doe';
    const unitHeader = req.headers['x-unit'] || 'Academic Affairs';
    req.user = {
        role: roleHeader,
        email: emailHeader,
        name: nameHeader,
        unit: unitHeader
    };
    next();
};
exports.mockAuthMiddleware = mockAuthMiddleware;
