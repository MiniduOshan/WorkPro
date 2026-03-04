import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import PricingPlan from '../models/PricingPlan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const plans = await PricingPlan.find({});
        console.log(`Found ${plans.length} plans:`);
        plans.forEach(p => {
            console.log(`- ${p.name}: Public=${p.isPublic}, Default=${p.isDefault}, Price=${p.price}`);
        });

        if (plans.length === 0) {
            console.log('No plans found! Seeding default plan...');
            await PricingPlan.create({
                name: 'Free',
                price: 0,
                isDefault: true,
                isPublic: true,
                limits: { maxUsers: 5, maxStorageStr: '1GB', maxStorageBytes: 1073741824 }
            });
            console.log('Default Free plan created.');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPlans();
