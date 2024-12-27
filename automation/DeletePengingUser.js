import cron from 'node-cron';
import { PendingUser } from '../models/PendingUserSchema.js';
export const deletePendingUsers = () =>  cron.schedule('*/10 * * * *', async () => { 
  try {
    console.log("Running job to delete expired pending users...");

    const result = await PendingUser.deleteMany({
      otpExpires: { $lt: new Date() }, 
    });

    console.log(`Deleted ${result.deletedCount} expired pending users.`);
  } catch (error) {
    console.error("Error deleting pending users:", error);
  }
});
