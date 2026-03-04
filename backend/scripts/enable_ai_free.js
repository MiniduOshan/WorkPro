import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const enableAiForFreePlan = async () => {
    await connectDB();

    try {
        const PricingPlan = (await import('../models/PricingPlan.js')).default;

        // Find the Free plan
        const freePlan = await PricingPlan.findOne({ name: 'Free' });

        if (freePlan) {
            console.log(`Current Free Plan Features:`, freePlan.features);

            // Enable AI Insights
            if (!freePlan.features.aiInsights) {
                freePlan.features.aiInsights = true;
                // Also ensure analytics is on if they want it
                freePlan.features.analytics = true;
                await freePlan.save();
                console.log('Successfully enabled aiInsights and analytics for Free Plan.');
            } else {
                console.log('Free Plan already has aiInsights enabled.');
            }
        } else {
            console.log('Free Plan not found in database.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

enableAiForFreePlan();
