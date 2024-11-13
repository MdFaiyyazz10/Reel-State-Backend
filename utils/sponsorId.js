export const generateSponsorId = async (model, prefix = "HBD2024") => {
    let sponsorId;
    let isUnique = false;

    while (!isUnique) {
        sponsorId = `${prefix}${Math.floor(10 + Math.random() * 90)}`; // Generates HBD2024XX 
        const existingUser = await model.findOne({ sponsorId });
        if (!existingUser) {
            isUnique = true;
        }
    }

    if (!sponsorId) {
        throw new Error("Unable to generate a unique sponsor ID");
    }

    return sponsorId;
};

