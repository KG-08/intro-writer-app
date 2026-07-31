const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    name: String,
    email: String,
    website: String,
    introduction: String,
    location: String
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        const newProfile = new Profile(req.body);
        await newProfile.save();

        return res.status(201).json({ message: 'Saved successfully!', data: newProfile });
    } catch (error) {
        console.error("MongoDB Serverless Error:", error);
        return res.status(500).json({ error: 'Failed to write record to Atlas Cluster' });
    }
}
