import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcryptjs';
import { Agent } from '../model/user.js'; 
import { Admin } from '../model/admin.js'; 
import crypto from 'crypto';
import validator from 'validator';
import { generateSponsorId } from '../utils/sponsorId.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'; 
import mongoose from 'mongoose';


export const registerAgent = async (req, res) => {
    try {
        const { sponsorId, name, email, phoneNumber, password, aadhaarNumber, panCard, role } = req.body;

        if (!["agent", "partner"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role selected. Must be either 'agent' or 'partner'." });
        }

        let agent = await Agent.findOne({ email });
        if (agent) {
            return res.status(400).json({ success: false, message: 'Agent already exists' });
        }

        if (phoneNumber && !validator.matches(phoneNumber, /^\d{10}$/)) {
            return res.status(400).json({ success: false, message: "Invalid phone number format. Must be 10 digits." });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const uniqueSponsorId = await generateSponsorId(Agent);

        const hashedPassword = bcrypt.hashSync(password, 10);

        agent = new Agent({
            sponsorId: uniqueSponsorId,
            name,
            email,
            phoneNumber,
            password: hashedPassword,
            aadhaarNumber,
            panCard,
            role,
        });

        await agent.save();

        if (sponsorId) {
            const adminReferrer = await Admin.findOne({ sponsorId });
            if (adminReferrer) {
                adminReferrer.referredUsers.push({
                    userId: agent._id,
                    registeredAt: new Date(),
                });
                await adminReferrer.save();
            } else {
                const agentReferrer = await Agent.findOne({ sponsorId });
                if (agentReferrer) {
                    agentReferrer.referredUsers.push({
                        userId: agent._id,
                        registeredAt: new Date(),
                    });
                    await agentReferrer.save();
                }
            }
        }

        agent.referralLink = `http://localhost:5173/login?sponsor=${uniqueSponsorId}`;
        
        await agent.save();

        res.status(201).json({
            success: true,
            message: 'Agent registered successfully',
            referralLink: agent.referralLink,
            agent
        });
    } catch (error) {
        console.error("Error in registration:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        const user = await Agent.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Agent Not Found" });
        }

        const validPassword = bcrypt.compareSync(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        const expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return res.status(200).cookie("agent_token", token, {
            httpOnly: true,
            expires: expireDate
        }).json({ success: true, message: "Logged In Successfully", user, token });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



export const updateAgent = async (req, res) => {
    try {
        const { name, dob, country, state, city, bankDetails, panPhoto, aadhaarPhoto, cancelledCheque, gender } = req.body;
        const agentId = req.params.id;  // Get agentId from URL parameter

        // Validate if the agentId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({ success: false, message: "Invalid agent ID" });
        }

        // Find the agent by agentId
        const agent = await Agent.findById(agentId);
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" });
        }

        // Update the agent's details
        if (name) agent.name = name;
        if (dob) agent.dob = dob;
        if (country) agent.country = country;
        if (state) agent.state = state;
        if (city) agent.city = city;
        if (gender) agent.gender = gender;
        if (bankDetails) agent.bankDetails = { ...agent.bankDetails, ...bankDetails };

        // Handle file uploads (if any)
        if (req.file) {
            const uploadedFile = await uploadOnCloudinary(req.file.path, 'kyc_documents');
            if (uploadedFile) {
                // Update the field based on the uploaded file
                if (req.body.documentType === 'profileImage') {
                    agent.profileImage = uploadedFile.url;
                } else if (req.body.documentType === 'panPhoto') {
                    agent.panPhoto = uploadedFile.url;
                } else if (req.body.documentType === 'aadhaarPhoto') {
                    agent.aadhaarPhoto = uploadedFile.url;
                } else if (req.body.documentType === 'cancelledCheque') {
                    agent.cancelledCheque = uploadedFile.url;
                }
            } else {
                return res.status(500).json({ success: false, message: "Error uploading file to Cloudinary" });
            }
        }

        // Save the updated agent document
        await agent.save();

        res.status(200).json({
            success: true,
            message: "Agent profile updated successfully",
            agent,
        });

    } catch (error) {
        console.error("Error in updating agent:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

