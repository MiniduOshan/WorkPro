import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const checkPlans = async () => {
    await connectDB();

    try {
        // dynamic import for ES modules
        const PricingPlan = (await import('../models/PricingPlan.js')).default;
        const Company = (await import('../models/Company.js')).default;

        const plans = await PricingPlan.find({});
        console.log('--- Configured Pricing Plans ---');
        plans.forEach(p => {
            console.log(`Plan: ${p.name}, Max Users: ${p.limits.maxUsers}, Default: ${p.isDefault}, ID: ${p._id}`);
        });

        const companies = await Company.find({}).populate('plan');
        console.log('\n--- Companies and Usage ---');
        companies.forEach(c => {
            const planName = c.plan ? c.plan.name : 'No Plan';
            const limit = c.plan ? c.plan.limits.maxUsers : 'N/A';
            console.log(`Company: ${c.name}, Plan: ${planName}, Limit: ${limit}, Members: ${c.members.length}`);
            // Check manual consistency
            if (limit !== -1 && c.members.length > limit) {
                console.warn(`WARNING: Company ${c.name} exceeds limit! (${c.members.length} > ${limit})`);
            }
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkPlans();
