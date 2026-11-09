from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.interview_routes import router as ai_router

app = FastAPI(
    title="InterviewIQ AI Service",
    description="Microservice for Question Generation, Live Answer Evaluation & Reporting",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "InterviewIQ AI Microservice",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

