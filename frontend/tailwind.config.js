/** @type {import('tailwindcss').Config} */
export default {
    // CRITICAL FIX: Enable dark mode based on the 'dark' class presence in the DOM
    // This allows the theme toggle in DashboardLayout.jsx to work
    darkMode: 'class', 
    
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Define the primary orange color based on your images
                primary: {
                    '500': '#FF8C00', // Used for buttons and accents
                    '600': '#E67E00', // Darker shade for hover
                },
                // Define the main background color
                'app-bg': '#f3f4f6', 
            },
        },
    },
    plugins: [],
}