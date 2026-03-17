const { getUserById, createUser, usersCollection } = require('./userModel');

const loginUser = async (req, res) => {
  try {
    const { email, name, picture } = req.user; // from decoded firebase token
    const uid = req.user.uid;

    let user = await getUserById(uid);

    // If user doesn't exist in our Firestore, create them (first-time login)
    if (!user) {
      user = await createUser(uid, { name, email, role: 'bidder', credits: 1000 }); // Default 1000 credits for testing
    }

    res.status(200).json({
      message: 'Login successful',
      user: user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to process login' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const user = await getUserById(uid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const getAllUsers = async (req, res) => {
    try {
        const snapshot = await usersCollection.get();
        const users = [];
        snapshot.forEach(doc => {
            users.push(doc.data());
        });
        res.status(200).json({ users });
    } catch(error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

const assignCredits = async (req, res) => {
    try {
        const { targetUid, amount } = req.body;
        
        if(!targetUid || !amount) {
            return res.status(400).json({ error: "Missing targetUid or amount" });
        }

        const { updateUserCredits } = require('./userModel');
        
        const targetUser = await getUserById(targetUid);
        if(!targetUser) return res.status(404).json({ error: "Target user not found" });

        const newBalance = await updateUserCredits(targetUid, Number(amount));

        res.status(200).json({ message: "Credits updated successfully", newBalance });
    } catch(error) {
         res.status(500).json({ error: 'Failed to assign credits' });
    }
}

const upgradeToOrganizer = async (req, res) => {
  try {
    const { uid } = req.user;
    await usersCollection.doc(uid).update({ role: 'organizer' });
    res.status(200).json({ message: 'Successfully upgraded to organizer' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upgrade role' });
  }
};

module.exports = {
  loginUser,
  getUserProfile,
  getAllUsers,
  assignCredits,
  upgradeToOrganizer
};
