// 📄 types/car.ts
export interface Car {
    id: number;
    make: string;
    model: string;
    price: number;
    electric: boolean;
    version: number;
}

export interface CarChangeLog {
    id: number;
    changes: {
        field: keyof Car;
        oldValue: any;
        newValue: any;
    }[];
    changedAt: Date;
    changedBy: string;
    version: number;
}