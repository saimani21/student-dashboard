from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import student, badges

app = FastAPI(title="Student Dashboard API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(student.router, prefix="/api", tags=["students"])
app.include_router(badges.router, prefix="/api", tags=["badges"])

@app.get("/")
async def root():
    return {"message": "Student Dashboard API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
