const Admin = require('../model/Admin');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (admin) => {
    const payload = {
        adminId: admin._id,
        email: admin.email,
        password: admin.password
    };
    return jwt.sign(payload, JWT_SECRET);
};


const registerAdmin = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        const existingAdmin = await Admin.findOne({email});
        if(existingAdmin){
            return res.status(400).json({
                success: false,
                message: 'Admin with this email already exists'
            });
        }

        const admin = new Admin({
            name,
            email,
            password
        });

        await admin.save();

        const token = generateToken(admin);

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data:{
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email
                },
                token
            }
        });
    } catch(error){
        console.error('Error registering admin:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registeration'
        });
    }
};

const loginAdmin = async (req, res) => {
    try{
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const admin = await Admin.findOne({email});
        if(!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        const isPasswordValid = await admin.comparePassword(password);
        if(!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(admin);
        res.json({
            success: true,
            message: 'Admin logged in successfully',
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email
                },
                token
            }
        });
    } catch(error){
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin
}