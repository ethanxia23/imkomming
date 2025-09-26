import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { access_token, limit = 100 } = await req.json();

    if (!access_token) {
      return NextResponse.json({ error: "Missing access token" }, { status: 400 });
    }

    // Path to the Python scraper script
    const scriptPath = path.join(process.cwd(), "wahoo_scraper.py");
    
    // Run the Python scraper
    const pythonProcess = spawn("python3", [
      scriptPath,
      "--token", access_token,
      "--limit", limit.toString(),
      "--export-json",
      "--quiet"
    ]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    return new Promise<NextResponse>(async (resolve) => {
      pythonProcess.on("close", async (code) => {
        if (code === 0) {
          // Try to read the generated JSON file
          const fs = await import("fs");
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const jsonFile = `wahoo_data_${timestamp}.json`;
          
          try {
            if (fs.existsSync(jsonFile)) {
              const data = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
              // Clean up the file
              fs.unlinkSync(jsonFile);
              resolve(NextResponse.json({ success: true, data }));
            } else {
              resolve(NextResponse.json({ 
                success: true, 
                message: "Scraping completed but no data file found",
                output 
              }));
            }
          } catch (fileError) {
            resolve(NextResponse.json({ 
              success: true, 
              message: "Scraping completed",
              output,
              error: fileError.message 
            }));
          }
        } else {
          resolve(NextResponse.json({ 
            error: "Python scraper failed", 
            code,
            output,
            errorOutput 
          }, { status: 500 }));
        }
      });
    });

  } catch (error) {
    console.error("Error running scraper:", error);
    return NextResponse.json(
      { error: "Failed to run scraper" },
      { status: 500 }
    );
  }
}
