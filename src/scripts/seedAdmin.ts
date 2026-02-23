import { prisma } from "../lib/prisma"
import { UserRole } from "../middleware/auth"

async function seedAdmin() {
    try {
        const adminData = {
            name: "admin2 shaheb",
            email: "admin2@admin.com",
            role: UserRole.ADMIN,
            password: "admin1234"
        }
        // check user exist on db or not
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        })
        if (existingUser) {
            throw new Error("User Already Exists!");
        }
        const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:4000"
            },
            body: JSON.stringify(adminData)
        })

        if (signUpAdmin.ok) {
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

seedAdmin();