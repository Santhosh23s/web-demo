// Function to show the selected page
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach((page) => {
      page.classList.add('hidden');
    });
  
    // Show the selected page
    document.getElementById(pageId).classList.remove('hidden');
  }


// Initialize Ace Editor
let editor = ace.edit("editor");
editor.setTheme("ace/theme/cobalt");
editor.session.setMode("ace/mode/javascript");

// Change Language
function changeLanguage() {
    let lang = document.getElementById("language").value;
    let mode = "ace/mode/text"; // Default mode

    if (lang === "javascript") mode = "ace/mode/javascript";
    else if (lang === "python") mode = "ace/mode/python";
    else if (lang === "java") mode = "ace/mode/java";
    else if (lang === "c" || lang === "cpp") mode = "ace/mode/c_cpp";

    editor.session.setMode(mode);
}

// Run Code
function runCode() {
    let code = editor.getValue();
    let language = document.getElementById("language").value;
    let outputDiv = document.getElementById("output");

    outputDiv.innerText = "Running..."; // Show running status

    if (language === "javascript") {
        runJavascript(code);
    } else if (language === "python") {
        runPython(code);
    } else {
        runBackendCode(code, language);
    }
}

function runJavascript() {
    let code = editor.getValue();
    let outputDiv = document.getElementById("output");

    // Reset output display
    outputDiv.innerText = "Running..."; // Show status before execution

    try {
        let oldConsoleLog = console.log;
        let outputData = [];

        // ✅ Capture console.log safely
        console.log = function (...args) {
            outputData.push(args.map(arg => typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg).join(" "));
            oldConsoleLog.apply(console, args);
        };

        // ✅ Wrap code execution in an IIFE (Immediate Function Execution)
        let wrappedCode = `
            (async function() {
                try {
                    ${code}
                } catch (error) {
                    console.log("Runtime Error:", error.message);
                }
            })();
        `;

        // ✅ Ensure UI updates fully before execution
        setTimeout(() => {
            try {
                new Function(wrappedCode)();
            } catch (error) {
                outputData.push("Execution Error: " + error.message);
            }

            // Restore console.log & Show Output
            console.log = oldConsoleLog;
            outputDiv.innerText = outputData.length > 0 ? outputData.join("\n") : "No output.";
        }, 100); // Delay increased for full log capture
    } catch (error) {
        outputDiv.innerText = "Execution Error: " + error.message;
    }
}



function runPython() {
    let code = editor.getValue();  // Get the code from the editor
    let outputDiv = document.getElementById("output");
    outputDiv.innerText = "";  // Clear previous output

    function builtinRead(x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
            throw "File not found: '" + x + "'";
        }
        return Sk.builtinFiles["files"][x];
    }

    Sk.configure({
        output: function (text) { outputDiv.innerText += text + "\n"; }, // Capture output
        read: builtinRead
    });

    Sk.misceval
        .asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code))
        .catch(err => (outputDiv.innerText = "Error: " + err.toString()));
}


// ✅ Fix for Java, C, C++ (JDoodle API)
function runBackendCode(code, language) {
    let outputDiv = document.getElementById("output");
    outputDiv.innerText = "Sending code to server...";

    fetch("https://api.jdoodle.com/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            script: code,
            language: language,
            versionIndex: "0",
            clientId: "your_client_id",
            clientSecret: "your_client_secret"
        })
    })
    .then(response => response.json())
    .then(data => {
        outputDiv.innerText = data.output || "No output.";
    })
    .catch(error => {
        outputDiv.innerText = "Execution Error: " + error.message;
    });
}
