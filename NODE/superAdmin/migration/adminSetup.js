import mongoose from 'mongoose';
import fs from 'fs';
import { cwd } from 'process';
import path from 'path';
import User from '../../auth/models/authModel.js'
import Role from '../models/roleModel.js'
import Permission from '../models/permissionModel.js'
import { configDotenv } from 'dotenv';
configDotenv(); 

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log('MongoDB connected successfully.');
        await defaultSetUp();
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};


async function defaultSetUp() {
    try {
        const superAdminpath_ = path.join(cwd(), '/superAdmin/DBTransaction/superAdmin.json');
        const rolepath_ = path.join(cwd(), '/superAdmin/DBTransaction/role.json');
        const permissionpath_ = path.join(cwd(), '/superAdmin/DBTransaction/permission.json');
        const superAdminData = await fs.readFileSync(superAdminpath_, 'utf8');
        const roleData = await fs.readFileSync(rolepath_, 'utf8');
        const permissionData = await fs.readFileSync(permissionpath_, 'utf8');
        const superAdmin = JSON.parse(superAdminData);
        const role = JSON.parse(roleData);
        const permission = JSON.parse(permissionData);
        // superAdmin._id = new mongoose.Types.ObjectId(superAdmin?._id);
        superAdmin._id = superAdmin?._id;
        await User.create(superAdmin);

        for (const item of role) {
            // item._id = new mongoose.Types.ObjectId(item._id);
            item._id = item._id;
            item.permission = item.permission.map(id => new mongoose.Types.ObjectId(id));
            await Role.create(item);
        }
        for (const item of permission) {
        //     item._id = new mongoose.Types.ObjectId(item._id);
        //     item.role_id = new mongoose.Types.ObjectId(item.role_id);
            item._id = item._id;
            item.role_id = item.role_id;
            await Permission.create(item);
        }
        console.log('Super admin created successfully.');
    } catch (error) {
        console.error('Error creating super admin:', error);
    } finally {
        // Disconnect from the database
        mongoose.disconnect();
    }
}

connectDB();
