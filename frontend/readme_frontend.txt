// install node
nvm install --lts
nvm install node
nvm use --lts
nvm alias default lts/*
node -v

// builds structure (do not use, only needed with new project)
npm create vite@latest frontend 

// modules
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react
npm install @tanstack/react-query
npm install formik yup
npm install semantic-ui-react
npm install react-use
npm install process
npm install mitt
npm install immer
npm i --save-dev @types/node

// start up
venv\Scripts\activate
cd frontend
npm run dev