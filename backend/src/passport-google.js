const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User'); // adjust path if needed

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_ROOT_URI || 'http://localhost:4000'}/api/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Try to find user by googleId or by email
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

    if (user) {
      // If user exists but doesn't have googleId, link it
      if (!user.googleId) {
        user.googleId = profile.id;
        user.avatar = profile.photos && profile.photos[0] && profile.photos[0].value;
        await user.save();
      }
      return done(null, user);
    }

    // Create new user
    user = new User({
      name: profile.displayName || (profile.name && `${profile.name.givenName} ${profile.name.familyName}`),
      email,
      googleId: profile.id,
      avatar: profile.photos && profile.photos[0] && profile.photos[0].value,
      isVerified: true // Google-authenticated users are considered verified
    });

    await user.save();
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));