import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import PricingPlan from '../models/PricingPlan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const fixPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await PricingPlan.updateMany(
            { name: 'Free' },
            { $set: { isPublic: true } }
        );

        console.log(`Updated ${result.modifiedCount} plans to be public.`);

        const plans = await PricingPlan.find({});
        plans.forEach(p => {
            console.log(`- ${p.name}: Public=${p.isPublic}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixPlans();
