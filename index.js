// Import Firebase methods
import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    sendEmailVerification, 
    signOut, 
    signInWithPopup, 
    GoogleAuthProvider,
    db,  
    addDoc, 
    collection,getDocs , doc, setDoc,updateDoc,serverTimestamp,
    arrayUnion, arrayRemove, deleteDoc, query,  orderBy,  onSnapshot,Timestamp
} from "./firebase.js";

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();

// Function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Function to validate password strength
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return passwordRegex.test(password);
};

let signUp = async () => {
    let name = document.getElementById("name").value;
    let number = document.getElementById("number").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let userData = { name, number, email, password };
    console.log(userData);

    // Validate email and password
    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!isValidPassword(password)) {
        alert("Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, and one number.");
        return;
    }

    // try {
    //     // Create user in Firebase Auth
    //     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //     const user = userCredential.user;

    //     // Add user data to Firestore
    //     const docRef = await addDoc(collection(db, "users"), {
    //         ...userData,
    //         uId: user.uid  // Fixed from `user.uId` to `user.uid`
    //     });

    //     console.log("Document written with ID:", docRef.id);
    //     alert("Signup Successful");
    //     // window.location.href = "signin.html"; // Redirect to sign-in page after successful sign-up
    // } catch (error) {
    //     console.error("Error:", error.message);
    //     alert("Error: " + error.message);
    // }

//  -----------------set doc---------
try {
    // Sign up the user and get the user object
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docRef = doc(db, "userdata", user.uid); // Now `user` is defined
    await setDoc(docRef, {
        ...userData,
        uId: user.uid
    });

    console.log("Document written with ID:", docRef.id);
    alert("Signup Successful");
    window.location.href = "main.html"; 
} catch (error) {
    console.error("Error:", error.message);
    alert("Error: " + error.message);
}

};

// Add event listener for Sign Up button
let sign_Up = document.getElementById("sign_Up");
if (sign_Up) {
    sign_Up.addEventListener("click", signUp);
}

// Sign In function
let sign_In = (event) => {
    event.preventDefault(); // Prevent form submission if using form elements

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            alert("Signed in successfully");
            window.location.href = "main.html";
        })
        .catch((error) => {
            console.error("Error:", error.message);
            alert("Error: " + error.message);
        });
};

// Add event listener to Sign In button
let signInButton = document.getElementById("signIn");
if (signInButton) {
    signInButton.addEventListener("click", sign_In);
}

// Monitor authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user);
    } else {
        console.log("No user is signed in");
    }
});

// Function to send email verification
let sendMail = () => {
    if (auth.currentUser) {
        sendEmailVerification(auth.currentUser)
            .then(() => {
                alert("Email verification sent");
            })
            .catch((error) => {
                console.error("Error sending verification email:", error.message);
            });
    } else {
        alert("No user is currently signed in.");
    }
};

// Add event listener to Email Verification button
let verification = document.getElementById("verify");
if (verification) {
    verification.addEventListener("click", sendMail);
}

// Sign Out function
let signout = () => {
    signOut(auth)
        .then(() => {
            console.log("Sign-out successful.");
            window.location.href = "signin.html"; // Redirect to sign-in page after successful sign-out
        })
        .catch((error) => {
            console.error("Error during sign-out:", error.message);
        });
};

// Add event listener to Sign Out button
let sign_out = document.getElementById("logout");
if (sign_out) {
    sign_out.addEventListener("click", signout);
}

// Google Sign-In function
const googleSignin = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user data exists in Firestore
        const userDoc = doc(db, "userdata", user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (!userSnapshot.exists()) {
            // Add new user to Firestore
            await setDoc(userDoc, {
                name: user.displayName,
                email: user.email,
                uid: user.uid,
                timestamp: serverTimestamp(),
            });
        }

        alert("User signed in successfully");
        window.location.href = "main.html";
    } catch (error) {
        console.error("Google Sign-In Error:", error.message);
        alert("Error: " + error.message);
    }
};


// Add event listener for Google Sign-In button
const googleBtn = document.getElementById("google");
if (googleBtn) {
    googleBtn.addEventListener("click", googleSignin);
}
let getData = async()=>
{
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`);
    });
}
getData()
// const Update = document.getElementById("update");
// if (googleBtn) {
//     Update.addEventListener("click", UpdateProfile);
// }

document.addEventListener("DOMContentLoaded", () => {
    const Update = document.getElementById("update");
    if (Update) { // Check if 'Update' element exists
        Update.addEventListener("click", UpdateProfile);
    } else {
        console.error("Element with ID 'update' not found.");
    }
});

let UpdateProfile = async () => {
    let name = document.getElementById("name").value;
    let phone = document.getElementById("phone").value;
    let password = document.getElementById("password").value;

    if (auth.currentUser) {
        let id = auth.currentUser.uid;

        try {
            const washingtonRef = doc(db, "userdata", id);
            await updateDoc(washingtonRef, { name,
                 phone, 
                 password,
                 timestamp: serverTimestamp(),
                //  subject:["Eng" , "Urdu"],
                //  subject:arrayUnion("Math"),
                //  subject:arrayRemove("Eng")
                }
                );
            alert("Updated");
        } catch (e) {
            console.error("Error updating document:", e);
        }
    } else {
        alert("You must be signed in to update your profile.");
    }
};
// Attach event listener for update button
let update = document.getElementById("update");
if (update) {
    update.addEventListener("click", UpdateProfile); // Attach event listener once
}

let deleteAccount=async()=>
{
  let id = auth.currentUser.uid
  console.log(id);
  await deleteDoc(doc(db, "userdata", id));
  alert("Delete Successfully")
}

let deleteButton = document.getElementById("delete");
if (deleteButton) {
    deleteButton.addEventListener("click", deleteAccount);
}

//POST
let addDocument = async () => {
  try {
    let title_input = document.getElementById("title");
    let desc_input = document.getElementById("description");
    title_input.style.display = "block";
    desc_input.style.display = "block";
    // Adding document to Firestore
    const docRef = await addDoc(collection(db, "Post"), {
      title: title_input.value,
      desc: desc_input.value,
      time: Timestamp.now(),
    });

    console.log("Successfully added document with ID: ", docRef.id);

    // Clear input fields
    title_input.value = '';
    desc_input.value = '';
  } catch (error) {
    console.log("Error adding document: ", error);
  }
};
// Add event listener to button
let button = document.getElementById("button");
button.addEventListener("click", addDocument);

let post = () => {
    try {
        const q = query(collection(db, "Post"), orderBy("time", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let post_data = document.getElementById("post_data");
            post_data.innerHTML = '';

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const timeString = data.time ? data.time.toDate() : "No Timestamp";
                post_data.innerHTML += `
                    <div class="card p-2 mb-2" data-id="${doc.id}">
                        <div class="card-header d-flex">
                            <div class="name-time d-flex flex-column">
                                Anonymous User
                                <div class="time">${timeString}</div>
                            </div>
                        </div>
                        <div style="background-color: lightgray;" class="card-body">
                            <blockquote class="blockquote mb-0">
                                <p class="title">${data.title}</p>
                                <footer class="blockquote-footer description">${data.desc}</footer>
                            </blockquote>
                        </div>
                        <div class="card-footer d-flex justify-content-end">
                            <button type="button" class="ms-2 btn editBtn">Edit</button>
                            <button type="button" class="ms-2 btn btn-danger" id="deleteBtn">Delete</button>
                        </div>
                    </div>`;

                // Attach event listener to the "Edit" button
                const editBtn = post_data.querySelectorAll(".editBtn");
                editBtn.forEach(button => {
                    button.addEventListener("click", (e) => {
                        const postId = e.target.closest('.card').getAttribute('data-id');
                        const cardElement = e.target.closest('.card');
                        const currentTitle = cardElement.querySelector('.title').innerText;
                        const currentDesc = cardElement.querySelector('.description').innerText;

                        // Fill the edit form with current values
                        document.getElementById("title").value = currentTitle;
                        document.getElementById("description").value = currentDesc;

                        // Attach the update function to the update button
                        let updateButton = document.getElementById("update_post");
                        if (updateButton) {
                            updateButton.onclick = () => UpdatePost(postId, currentTitle, currentDesc, cardElement);
                        }
                    });
                });
            });
        });

        return unsubscribe;
    } catch (error) {
        console.error("Error fetching posts: ", error);
    }
};

// Update the post in Firestore and update the UI
let UpdatePost = async (postId, currentTitle, currentDesc, cardElement) => {
    let title = document.getElementById("title").value || currentTitle;
    let desc = document.getElementById("description").value || currentDesc;

    if (auth.currentUser) {
        try {
            // Get a reference to the specific post document in Firestore
            const postRef = doc(db, "Post", postId);
            await updateDoc(postRef, { 
                title,
                desc, 
                time: serverTimestamp(),  // Optionally update the timestamp
            });

            alert("Post updated successfully");

            // After updating in Firestore, update the UI immediately for the same post
            const titleElement = cardElement.querySelector('.title');
            const descElement = cardElement.querySelector('.description');

            // Update the title and description on the card
            if (titleElement && descElement) {
                titleElement.innerText = title;  // Update the title
                descElement.innerText = desc;  // Update the description
            }
        } catch (e) {
            console.error("Error updating document:", e);
        }
    } else {
        alert("You must be signed in to update a post.");
    }

    let deleteAccount=async()=>
        {
            button.addEventListener("click", (e) => {
                // Log to ensure the postId is being fetched correctly
                const postId = e.target.closest('.card').getAttribute('data-id');
                console.log("Post ID to delete:", postId);  // Debugging line
        
                if (postId) {
                    deletePost(postId);  // Call deletePost function with postId
                } else {
                    console.error("Post ID is missing!");
                }
            });
        }
        
        let deleteButton = document.getElementById("deleteBtn");
        if (deleteButton) {
            deleteButton.addEventListener("click", deleteAccount);
        }
   
}

post();
