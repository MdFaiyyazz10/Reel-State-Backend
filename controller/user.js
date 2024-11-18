import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Agent } from '../model/user.js';
import { Admin } from '../model/admin.js';
import mongoose from 'mongoose';
import validator from 'validator';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { generateSponsorId } from '../utils/sponsorId.js';

// Register Agent
export const registerAgent = async (req, res) => {
    try {
        const { sponsorId, name, email, phoneNumber, password, aadhaarNumber, panCard, role } = req.body;

        // Role validation
        if (!["agent", "partner"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role. Must be either 'agent' or 'partner'." });
        }

        // Check if agent already exists
        let agent = await Agent.findOne({ email });
        if (agent) {
            return res.status(400).json({ success: false, message: 'Agent already exists' });
        }

        // Phone number validation
        if (phoneNumber && !validator.matches(phoneNumber, /^\d{10}$/)) {
            return res.status(400).json({ success: false, message: "Invalid phone number format. Must be 10 digits." });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        // Generate unique Sponsor ID
        const uniqueSponsorId = await generateSponsorId(Agent);

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create agent
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

        // Handle referral logic if sponsorId is provided
        if (sponsorId) {
            const referrer = await Admin.findOne({ sponsorId }) || await Agent.findOne({ sponsorId });
            if (referrer) {
                referrer.referredUsers.push({
                    userId: agent._id,
                    registeredAt: new Date(),
                });
                await referrer.save();
            }
        }

        // Generate referral link
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

// Sign-in agent
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        const user = await Agent.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Agent not found" });
        }

        const validPassword = bcrypt.compareSync(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        const expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return res.status(200).cookie("agent_token", token, {
            httpOnly: true,
            expires: expireDate
        }).json({ success: true, message: "Logged in successfully", user, token });

    } catch (error) {
        console.error("Error during sign-in:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update agent profile
export const updateAgent = async (req, res) => {
    try {
        const { name, dob, country, state, city, gender, bankName, accountHolderName, accountNumber, ifsc, branch } = req.body;
        const agentId = req.params.id;

        // Validate agentId
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({ success: false, message: "Invalid agent ID" });
        }

        // Find the agent
        const agent = await Agent.findById(agentId);
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" });
        }

        // Update basic details
        if (name) agent.name = name;
        if (dob) agent.dob = dob;
        if (country) agent.country = country;
        if (state) agent.state = state;
        if (city) agent.city = city;
        if (gender) agent.gender = gender;

        // Update bank details with validation
        if (bankName || accountHolderName || accountNumber || ifsc || branch) {
            if (!bankName || !accountHolderName || !accountNumber || !ifsc || !branch) {
                return res.status(400).json({ success: false, message: "All bank details must be provided." });
            }

            // Basic validation for IFSC code format
            const ifscRegex = /^[A-Za-z]{4}0[A-Z0-9a-z]{6}$/;
            if (!ifsc.match(ifscRegex)) {
                return res.status(400).json({ success: false, message: "Invalid IFSC code format" });
            }

            agent.bankName = bankName;
            agent.accountHolderName = accountHolderName;
            agent.accountNumber = accountNumber;
            agent.ifsc = ifsc;
            agent.branch = branch;
        }

        // Handle file uploads
        if (req.files) {
            const fileFields = ["profileImage", "panPhoto", "aadhaarPhoto", "cancelledCheque"];

            for (const field of fileFields) {
                if (req.files[field]) {
                    const file = req.files[field][0]; // Each field should have only one file
                    const uploadedFile = await uploadOnCloudinary(file.path, "kyc_documents");

                    if (!uploadedFile) {
                        return res.status(500).json({ success: false, message: `Error uploading ${field} to Cloudinary` });
                    }

                    // Map uploaded file URLs to corresponding fields
                    switch (field) {
                        case "profileImage":
                            agent.profileImage = uploadedFile.url;
                            break;
                        case "panPhoto":
                            agent.panPhoto = uploadedFile.url;
                            break;
                        case "aadhaarPhoto":
                            agent.aadhaarPhoto = uploadedFile.url;
                            break;
                        case "cancelledCheque":
                            agent.cancelledCheque = uploadedFile.url;
                            break;
                        default:
                            return res.status(400).json({ success: false, message: `Unexpected file field: ${field}` });
                    }
                }
            }
        }

        // Save updated agent document
        await agent.save();

        res.status(200).json({
            success: true,
            message: "Agent profile updated successfully",
            agent,
        });

    } catch (error) {
        console.error("Error in updating agent:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
