package com.placementportal.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * OpenAI-compatible implementation of AiService.
 * Works with OpenAI, Azure OpenAI, or any compatible API.
 */
@Service
@RequiredArgsConstructor
public class OpenAiServiceImpl implements AiService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAiServiceImpl.class);

    @Value("${app.ai.provider:gemini}")
    private String provider;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.api-url:}")
    private String apiUrl;

    @Value("${app.ai.model:gemini-3.8-flash}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String chat(String userMessage, List<Map<String, String>> conversationHistory) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content",
                "You are a helpful placement preparation assistant. Help students prepare for campus placements " +
                "by answering questions about aptitude, coding, HR interviews, and technical concepts."));

        if (conversationHistory != null) {
            messages.addAll(conversationHistory);
        }
        messages.add(Map.of("role", "user", "content", userMessage));

        return callApi(messages);
    }

    @Override
    public String analyzeResume(String resumeText) {
        if (resumeText == null || resumeText.trim().length() < 100 || !isLikelyResume(resumeText)) {
            return "{\"isResume\": false, \"error\": \"The uploaded text does not meet resume criteria. A valid resume must contain standard sections such as Education, Technical Skills, Projects, or Experience.\"}";
        }

        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content",
                        "You are an expert resume reviewer for campus placement preparation.\n" +
                        "STEP 1: Verify whether the user's text is actually a candidate resume or CV for jobs/internships.\n" +
                        "If the text is NOT a resume (e.g. random dialogue, lyrics, food recipe, essay, problem statement, or non-resume content), you MUST output ONLY this JSON format:\n" +
                        "{\n" +
                        "  \"isResume\": false,\n" +
                        "  \"error\": \"The uploaded text is not recognized as a resume. Please provide a document with sections like Education, Technical Skills, Projects, and Experience.\"\n" +
                        "}\n\n" +
                        "STEP 2: If it IS a valid resume, analyze it thoroughly and output ONLY valid JSON in this exact structure:\n" +
                        "{\n" +
                        "  \"isResume\": true,\n" +
                        "  \"score\": 75,\n" +
                        "  \"atsScore\": 70,\n" +
                        "  \"strengths\": [\"...\"],\n" +
                        "  \"weaknesses\": [\"...\"],\n" +
                        "  \"suggestions\": [\"...\"]\n" +
                        "}\n" +
                        "Return ONLY valid JSON without markdown fences."),
                Map.of("role", "user", "content", "Document to review:\n\n" + resumeText)
        );
        return callApi(messages);
    }

    private boolean isLikelyResume(String text) {
        if (text == null || text.trim().length() < 100) return false;
        String lower = text.toLowerCase();

        boolean hasEducation = lower.matches("(?s).*\\b(education|degree|b\\.?tech|b\\.?e|m\\.?tech|m\\.?e|bca|mca|bachelor|master|university|college|school|cgpa|gpa|percentage|academics|diploma)\\b.*");
        boolean hasSkills = lower.matches("(?s).*\\b(skills|technical skills|technologies|programming|languages|frameworks|tools|competencies|proficiencies|database|tech stack|libraries|developer)\\b.*");
        boolean hasProjects = lower.matches("(?s).*\\b(experience|work experience|employment|internship|intern|projects|project|responsibilities|contributions|developed|implemented|designed|built)\\b.*");
        boolean hasContact = lower.matches("(?s).*\\b(email|phone|mobile|contact|linkedin|github|portfolio|summary|objective|profile)\\b.*") || lower.contains("@");

        int matches = (hasEducation ? 1 : 0) + (hasSkills ? 1 : 0) + (hasProjects ? 1 : 0) + (hasContact ? 1 : 0);
        return matches >= 2;
    }

    @Override
    public String generateInterviewQuestions(String topic, String difficulty) {
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content",
                        "You are an expert interviewer for campus placements. Generate interview questions " +
                        "in JSON array format with fields: question, expectedKeyPoints, difficulty."),
                Map.of("role", "user", "content",
                        String.format("Generate 5 %s level interview questions on the topic: %s", difficulty, topic))
        );
        return callApi(messages);
    }

    @Override
    public String evaluateInterviewAnswer(String question, String answer, String topic) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("sk-placeholder")) {
            logger.info("No valid AI API key configured — using mock interview evaluation.");
            return generateMockEvaluation(question, answer, topic);
        }

        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content",
                        "You are an expert technical interviewer evaluating a candidate's answer. Provide a constructive, personalized evaluation structured as:\n" +
                        "Score: X/10 (0/10 if blank/no answer, 1-4 for incomplete, 5-7 for good, 8-10 for thorough and accurate)\n\n" +
                        "Strengths:\n- [key positive observation]\n\n" +
                        "Areas for Improvement:\n- [missing technical nuances or corrections]\n\n" +
                        "Model Answer:\n[an ideal response]\n\n" +
                        "Keep it direct, professional, and formatted in clear readable text without markdown fences."),
                Map.of("role", "user", "content",
                        String.format("Topic: %s\nQuestion: %s\nCandidate's Answer: %s",
                                topic != null ? topic : "General",
                                question != null ? question : "",
                                (answer != null && !answer.isBlank()) ? answer : "(No answer provided)"))
        );
        return callApi(messages);
    }

    private String callApi(List<Map<String, String>> messages) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("sk-placeholder") || apiKey.equals("placeholder")) {
            logger.info("No valid AI API key configured — using mock fallback.");
            return generateMockResponse(messages);
        }

        try {
            if (isGeminiProvider()) {
                return callGeminiApi(messages);
            } else {
                return callOpenAiApi(messages);
            }
        } catch (Exception e) {
            logger.error("AI API call failed: {} — falling back to mock response.", e.getMessage());
            return generateMockResponse(messages);
        }
    }

    private boolean isGeminiProvider() {
        if (provider != null && provider.equalsIgnoreCase("gemini")) {
            return true;
        }
        if (apiKey != null) {
            String key = apiKey.trim();
            if (key.startsWith("AIza") || key.startsWith("AQ.")) {
                return true;
            }
            if (!key.startsWith("sk-")) {
                return true;
            }
        }
        if (apiUrl != null && apiUrl.contains("googleapis.com")) {
            return true;
        }
        return false;
    }

    private String resolveGeminiModel() {
        if (model != null && !model.isBlank() && !model.startsWith("gpt") && !model.contains("1.5") && !model.equals("gemini-2.5-flash")) {
            return model;
        }
        return "gemini-3.5-flash";
    }

    private String callGeminiApi(List<Map<String, String>> messages) {
        String configuredModel = resolveGeminiModel();
        List<String> modelsToTry = new ArrayList<>();
        modelsToTry.add(configuredModel);
        if (!configuredModel.equals("gemini-3.5-flash")) modelsToTry.add("gemini-3.5-flash");
        if (!configuredModel.equals("gemini-3.8-flash")) modelsToTry.add("gemini-3.8-flash");
        if (!configuredModel.equals("gemini-flash-latest")) modelsToTry.add("gemini-flash-latest");
        if (!configuredModel.equals("gemini-3.1-flash-lite")) modelsToTry.add("gemini-3.1-flash-lite");

        for (String candidateModel : modelsToTry) {
            try {
                return executeGeminiRequest(messages, candidateModel);
            } catch (Exception e) {
                logger.warn("Gemini candidate {} returned error: {} — trying next available model.", candidateModel, e.getMessage());
            }
        }
        logger.error("All Gemini model candidates failed — falling back to educational response.");
        return generateMockResponse(messages);
    }

    private String executeGeminiRequest(List<Map<String, String>> messages, String targetModel) {
        String targetUrl;
        if (apiUrl != null && !apiUrl.isBlank()) {
            targetUrl = apiUrl.endsWith("/") ? apiUrl.substring(0, apiUrl.length() - 1) : apiUrl;
            if (!targetUrl.contains("/models/")) {
                targetUrl = targetUrl + "/models/" + targetModel + ":generateContent?key=" + apiKey.trim();
            } else if (!targetUrl.contains("key=")) {
                targetUrl = targetUrl + "?key=" + apiKey.trim();
            }
        } else {
            targetUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + targetModel + ":generateContent?key=" + apiKey.trim();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemPrompt = null;
        List<Map<String, Object>> contents = new ArrayList<>();

        for (Map<String, String> msg : messages) {
            String role = msg.get("role");
            String content = msg.get("content");
            if (content == null || content.isBlank()) continue;

            if ("system".equalsIgnoreCase(role)) {
                systemPrompt = (systemPrompt == null) ? content : systemPrompt + "\n" + content;
            } else {
                String geminiRole = "user".equalsIgnoreCase(role) ? "user" : "model";
                contents.add(Map.of(
                    "role", geminiRole,
                    "parts", List.of(Map.of("text", content))
                ));
            }
        }

        if (contents.isEmpty()) {
            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", "Hello"))
            ));
        }

        Map<String, Object> body = new HashMap<>();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            body.put("systemInstruction", Map.of(
                "parts", List.of(Map.of("text", systemPrompt))
            ));
        }
        body.put("contents", contents);

        Map<String, Object> genConfig = new HashMap<>();
        genConfig.put("temperature", 0.7);
        genConfig.put("maxOutputTokens", 2048);
        body.put("generationConfig", genConfig);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(targetUrl, request, Map.class);

        if (response.getBody() != null) {
            Map respMap = response.getBody();
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) respMap.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> firstCandidate = candidates.get(0);
                Map<String, Object> contentMap = (Map<String, Object>) firstCandidate.get("content");
                if (contentMap != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        if (text != null && !text.isBlank()) {
                            return text;
                        }
                    }
                }
            }
        }

        throw new RuntimeException("Gemini returned empty response body");
    }

    private String callOpenAiApi(List<Map<String, String>> messages) {
        String effectiveUrl = (apiUrl != null && !apiUrl.isBlank()) ? apiUrl : "https://api.openai.com/v1";
        if (effectiveUrl.endsWith("/")) {
            effectiveUrl = effectiveUrl.substring(0, effectiveUrl.length() - 1);
        }
        if (!effectiveUrl.endsWith("/chat/completions")) {
            effectiveUrl = effectiveUrl + "/chat/completions";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey.trim());

        Map<String, Object> body = new HashMap<>();
        body.put("model", (model != null && !model.isBlank()) ? model : "gpt-3.5-turbo");
        body.put("messages", messages);
        body.put("max_tokens", 2000);
        body.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(effectiveUrl, request, Map.class);

        if (response.getBody() != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }
        logger.warn("OpenAI API returned empty response body — falling back to mock.");
        return generateMockResponse(messages);
    }

    // ─── Educational mock fallback ────────────────────────────────────────────
    private String generateMockResponse(List<Map<String, String>> messages) {
        String lastMessage = messages.get(messages.size() - 1).get("content").toLowerCase();

        // ── Structured-data responses (used by resume/interview controllers) ──
        if ((lastMessage.contains("resume") || lastMessage.contains("cv") || lastMessage.contains("document to review")) && (lastMessage.contains("analyz") || lastMessage.contains("review"))) {
            String userDoc = messages.get(messages.size() - 1).get("content");
            if (userDoc.contains("Document to review:\n\n")) {
                userDoc = userDoc.substring(userDoc.indexOf("Document to review:\n\n") + "Document to review:\n\n".length());
            }
            if (!isLikelyResume(userDoc)) {
                return "{\"isResume\": false, \"error\": \"The uploaded text does not appear to be a resume. A valid resume must contain standard sections such as Education, Technical Skills, Projects, or Experience.\"}";
            }
            return "{\"isResume\": true, \"score\": 72, \"strengths\": [\"Good technical skills section\", \"Clear project descriptions\"], " +
                   "\"weaknesses\": [\"Missing quantified achievements\", \"No summary statement\"], " +
                   "\"suggestions\": [\"Add metrics to project descriptions\", \"Include a professional summary\", " +
                   "\"Add relevant certifications\", \"Use action verbs\"], \"atsScore\": 68}";
        }

        // ── Interview question generation — topic + difficulty aware ──────────
        if (lastMessage.contains("generate") && lastMessage.contains("interview") && lastMessage.contains("question")) {
            return generateMockInterviewQuestions(lastMessage);
        }

        // ── Interview answer evaluation ────────────────────────────────────────
        if (lastMessage.contains("topic:") && lastMessage.contains("question:") && lastMessage.contains("candidate")) {
            return parseAndGenerateMockEvaluation(messages.get(messages.size() - 1).get("content"));
        }
        // Legacy fallback matcher
        if (lastMessage.contains("evaluate") && lastMessage.contains("answer")) {
            return parseAndGenerateMockEvaluation(messages.get(messages.size() - 1).get("content"));
        }

        // ─────────────────────────────────────────────────────────────────────
        // Educational chat responses — keyword-matched
        // ─────────────────────────────────────────────────────────────────────

        // ── OOP concepts ──────────────────────────────────────────────────────
        if (contains(lastMessage, "encapsulat")) {
            return "**Encapsulation** is one of the four pillars of Object-Oriented Programming (OOP).\n\n" +
                   "It means bundling data (fields) and the methods that operate on that data inside a single class, " +
                   "and restricting direct access to the internal state from outside the class.\n\n" +
                   "**Key idea:** Hide internal details; expose only what is necessary through a public interface.\n\n" +
                   "**Java example:**\n" +
                   "```java\n" +
                   "public class BankAccount {\n" +
                   "    private double balance;  // hidden from outside\n\n" +
                   "    public double getBalance() { return balance; }\n\n" +
                   "    public void deposit(double amount) {\n" +
                   "        if (amount > 0) balance += amount;\n" +
                   "    }\n" +
                   "}\n" +
                   "```\n\n" +
                   "**Benefits:** Data integrity, security, easier maintenance, and reduced coupling.";
        }

        if (contains(lastMessage, "inherit")) {
            return "**Inheritance** allows a class (child/subclass) to acquire the properties and methods of another class (parent/superclass).\n\n" +
                   "**Key benefits:**\n" +
                   "- Code reuse — avoid duplicating common logic\n" +
                   "- Establishes an IS-A relationship\n" +
                   "- Enables polymorphism\n\n" +
                   "**Java example:**\n" +
                   "```java\n" +
                   "class Animal {\n" +
                   "    String name;\n" +
                   "    void eat() { System.out.println(name + \" eats\"); }\n" +
                   "}\n\n" +
                   "class Dog extends Animal {\n" +
                   "    void bark() { System.out.println(\"Woof!\"); }\n" +
                   "}\n\n" +
                   "Dog d = new Dog();\n" +
                   "d.name = \"Rex\";\n" +
                   "d.eat();  // inherited from Animal\n" +
                   "d.bark(); // Dog's own method\n" +
                   "```\n\n" +
                   "Java supports **single inheritance** for classes but **multiple inheritance** through interfaces.";
        }

        if (contains(lastMessage, "polymorphi")) {
            return "**Polymorphism** means 'many forms'. An object can behave differently depending on its actual type.\n\n" +
                   "**Two types:**\n" +
                   "1. **Compile-time (method overloading)** — same method name, different parameters.\n" +
                   "2. **Runtime (method overriding)** — subclass provides its own implementation of a parent method.\n\n" +
                   "**Example:**\n" +
                   "```java\n" +
                   "class Shape {\n" +
                   "    double area() { return 0; }\n" +
                   "}\n" +
                   "class Circle extends Shape {\n" +
                   "    double r;\n" +
                   "    Circle(double r) { this.r = r; }\n" +
                   "    @Override double area() { return Math.PI * r * r; }\n" +
                   "}\n" +
                   "class Rectangle extends Shape {\n" +
                   "    double w, h;\n" +
                   "    Rectangle(double w, double h) { this.w = w; this.h = h; }\n" +
                   "    @Override double area() { return w * h; }\n" +
                   "}\n\n" +
                   "Shape s = new Circle(5);   // runtime polymorphism\n" +
                   "System.out.println(s.area()); // 78.54\n" +
                   "```";
        }

        if (contains(lastMessage, "abstract") && !contains(lastMessage, "class vs")) {
            return "**Abstraction** hides implementation complexity and exposes only what the user needs.\n\n" +
                   "In Java, abstraction is achieved through:\n" +
                   "1. **Abstract classes** — can have abstract (no body) and concrete methods.\n" +
                   "2. **Interfaces** — define a contract; all methods are abstract by default (Java 7), or can have `default` implementations (Java 8+).\n\n" +
                   "**Abstract class vs Interface:**\n" +
                   "| Feature | Abstract Class | Interface |\n" +
                   "|---|---|---|\n" +
                   "| Multiple inheritance | No | Yes |\n" +
                   "| Constructor | Yes | No |\n" +
                   "| Fields | Any | `public static final` only |\n" +
                   "| Method body | Yes | `default`/`static` only |\n\n" +
                   "Use an **abstract class** for shared base logic; use an **interface** for defining a capability.";
        }

        if (contains(lastMessage, "oop") || contains(lastMessage, "object oriented") || contains(lastMessage, "object-oriented")) {
            return "**Object-Oriented Programming (OOP)** organizes software around objects rather than functions.\n\n" +
                   "**Four Pillars:**\n" +
                   "1. **Encapsulation** — bundle data + methods; hide internal state.\n" +
                   "2. **Inheritance** — child class acquires parent class properties.\n" +
                   "3. **Polymorphism** — same interface, different behaviour.\n" +
                   "4. **Abstraction** — hide complexity; expose only essentials.\n\n" +
                   "**Core concepts:** Classes & Objects, Constructors, Method overloading/overriding, `this` / `super` keywords, Static vs instance members.\n\n" +
                   "Ask me about any specific OOP concept for a detailed explanation!";
        }

        // ── Java ──────────────────────────────────────────────────────────────
        if (contains(lastMessage, "java collection") || contains(lastMessage, "arraylist") ||
            contains(lastMessage, "hashmap") || contains(lastMessage, "linked list") && contains(lastMessage, "java")) {
            return "**Java Collections Framework** provides ready-to-use data structures.\n\n" +
                   "**Most common implementations:**\n\n" +
                   "| Interface | Class | Use when |\n" +
                   "|---|---|---|\n" +
                   "| List | `ArrayList` | Fast random access, dynamic array |\n" +
                   "| List | `LinkedList` | Fast insert/delete at ends |\n" +
                   "| Set | `HashSet` | Unique elements, O(1) lookup |\n" +
                   "| Set | `TreeSet` | Unique elements, sorted order |\n" +
                   "| Map | `HashMap` | Key-value pairs, O(1) get/put |\n" +
                   "| Map | `TreeMap` | Sorted key-value pairs |\n" +
                   "| Queue | `PriorityQueue` | Min/max heap operations |\n\n" +
                   "**Quick example:**\n" +
                   "```java\n" +
                   "Map<String, Integer> scores = new HashMap<>();\n" +
                   "scores.put(\"Alice\", 95);\n" +
                   "scores.put(\"Bob\",   88);\n" +
                   "scores.getOrDefault(\"Charlie\", 0); // 0\n" +
                   "```";
        }

        if (contains(lastMessage, "java thread") || contains(lastMessage, "multithreading") || contains(lastMessage, "concurrency")) {
            return "**Java Multithreading & Concurrency**\n\n" +
                   "A thread is the smallest unit of CPU execution. Java supports multithreading natively.\n\n" +
                   "**Creating threads:**\n" +
                   "```java\n" +
                   "// Option 1: extend Thread\n" +
                   "class MyThread extends Thread {\n" +
                   "    public void run() { System.out.println(\"Running\"); }\n" +
                   "}\n\n" +
                   "// Option 2: implement Runnable (preferred)\n" +
                   "Runnable r = () -> System.out.println(\"Running\");\n" +
                   "new Thread(r).start();\n\n" +
                   "// Option 3: ExecutorService (production code)\n" +
                   "ExecutorService pool = Executors.newFixedThreadPool(4);\n" +
                   "pool.submit(() -> doWork());\n" +
                   "```\n\n" +
                   "**Key terms:** synchronized, volatile, ReentrantLock, wait/notify, CompletableFuture, race condition, deadlock.";
        }

        if (contains(lastMessage, "spring boot") || contains(lastMessage, "spring framework") || contains(lastMessage, "dependency injection")) {
            return "**Spring Boot** is a framework that simplifies building production-ready Java applications.\n\n" +
                   "**Core concepts:**\n" +
                   "- **IoC Container** — Spring manages object creation and lifecycle.\n" +
                   "- **Dependency Injection (DI)** — dependencies are injected rather than created inside a class.\n" +
                   "- **Auto-configuration** — Spring Boot configures itself based on classpath and properties.\n\n" +
                   "**Quick REST API example:**\n" +
                   "```java\n" +
                   "@RestController\n" +
                   "@RequestMapping(\"/api/students\")\n" +
                   "public class StudentController {\n" +
                   "    @Autowired StudentService service;\n\n" +
                   "    @GetMapping\n" +
                   "    public List<Student> getAll() { return service.findAll(); }\n\n" +
                   "    @PostMapping\n" +
                   "    public Student create(@RequestBody Student s) { return service.save(s); }\n" +
                   "}\n" +
                   "```\n\n" +
                   "**Key annotations:** `@SpringBootApplication`, `@RestController`, `@Service`, `@Repository`, `@Autowired`, `@Value`, `@Entity`.";
        }

        if (contains(lastMessage, "java") && contains(lastMessage, "interview")) {
            return "**Java Interview Preparation Guide**\n\n" +
                   "**Top topics to master:**\n\n" +
                   "1. **OOP** — Encapsulation, Inheritance, Polymorphism, Abstraction.\n" +
                   "2. **Core Java** — String handling, wrapper classes, autoboxing, varargs, generics.\n" +
                   "3. **Collections** — ArrayList, HashMap, HashSet, TreeMap, Iterator, Comparator.\n" +
                   "4. **Multithreading** — Thread, Runnable, synchronized, ExecutorService, CompletableFuture.\n" +
                   "5. **Java 8+** — Streams, Lambda, Optional, Functional interfaces.\n" +
                   "6. **Exception handling** — checked vs unchecked, try-with-resources, custom exceptions.\n" +
                   "7. **JVM internals** — Heap/Stack, Garbage Collection, ClassLoader.\n\n" +
                   "**Common interview questions:**\n" +
                   "- Difference between `==` and `.equals()`?\n" +
                   "- Why is String immutable in Java?\n" +
                   "- Explain the Java memory model.\n" +
                   "- What is the difference between `ArrayList` and `LinkedList`?\n\n" +
                   "Ask me any of these for a detailed answer!";
        }

        // ── SQL / DBMS ────────────────────────────────────────────────────────
        if (contains(lastMessage, "sql join") || (contains(lastMessage, "join") && contains(lastMessage, "sql"))) {
            return "**SQL Joins** combine rows from two or more tables based on a related column.\n\n" +
                   "**Types of Joins:**\n\n" +
                   "| Join Type | Returns |\n" +
                   "|---|---|\n" +
                   "| `INNER JOIN` | Rows matching in **both** tables |\n" +
                   "| `LEFT JOIN` | All rows from left + matching from right |\n" +
                   "| `RIGHT JOIN` | All rows from right + matching from left |\n" +
                   "| `FULL OUTER JOIN` | All rows from both tables |\n" +
                   "| `CROSS JOIN` | Cartesian product of both tables |\n\n" +
                   "**Example:**\n" +
                   "```sql\n" +
                   "-- Tables: employees(id, name, dept_id), departments(id, dept_name)\n\n" +
                   "-- INNER JOIN: employees who have a matching department\n" +
                   "SELECT e.name, d.dept_name\n" +
                   "FROM employees e\n" +
                   "INNER JOIN departments d ON e.dept_id = d.id;\n\n" +
                   "-- LEFT JOIN: all employees, even without a department\n" +
                   "SELECT e.name, d.dept_name\n" +
                   "FROM employees e\n" +
                   "LEFT JOIN departments d ON e.dept_id = d.id;\n" +
                   "```\n\n" +
                   "**Tip for interviews:** Always clarify which join to use — the most common interview mistake is using INNER when LEFT is expected.";
        }

        if (contains(lastMessage, "sql") || contains(lastMessage, "database") || contains(lastMessage, "dbms")) {
            return "**SQL & DBMS — Key Concepts for Interviews**\n\n" +
                   "**SQL basics:**\n" +
                   "- **DDL:** CREATE, ALTER, DROP (structure)\n" +
                   "- **DML:** SELECT, INSERT, UPDATE, DELETE (data)\n" +
                   "- **DCL:** GRANT, REVOKE (permissions)\n\n" +
                   "**Important DBMS topics:**\n" +
                   "- **Normalization:** 1NF → 2NF → 3NF → BCNF — eliminate redundancy.\n" +
                   "- **Transactions & ACID:** Atomicity, Consistency, Isolation, Durability.\n" +
                   "- **Indexing:** B-Tree index speeds up SELECT; slows INSERT/UPDATE.\n" +
                   "- **Joins:** INNER, LEFT, RIGHT, FULL OUTER, CROSS.\n" +
                   "- **Subqueries & CTEs:** Nested SELECT / WITH clause.\n" +
                   "- **Stored procedures & triggers.**\n\n" +
                   "Ask me about any specific SQL concept for a detailed answer!";
        }

        // ── Data Structures & Algorithms ──────────────────────────────────────
        if (contains(lastMessage, "big o") || contains(lastMessage, "time complexity") || contains(lastMessage, "space complexity")) {
            return "**Big O Notation** describes how the runtime or space of an algorithm grows as input size (n) increases.\n\n" +
                   "**Common complexities (best → worst):**\n\n" +
                   "| Big O | Name | Example |\n" +
                   "|---|---|---|\n" +
                   "| O(1) | Constant | Array index access |\n" +
                   "| O(log n) | Logarithmic | Binary search |\n" +
                   "| O(n) | Linear | Loop through array |\n" +
                   "| O(n log n) | Linearithmic | Merge sort, Quick sort |\n" +
                   "| O(n²) | Quadratic | Bubble sort, nested loops |\n" +
                   "| O(2ⁿ) | Exponential | Recursive Fibonacci |\n\n" +
                   "**Key rule:** Always analyze worst-case unless asked otherwise.\n\n" +
                   "**Example:** Binary Search is O(log n) because it halves the search space each step.";
        }

        if (contains(lastMessage, "array") && (contains(lastMessage, "linked list") || contains(lastMessage, "vs"))) {
            return "**Array vs Linked List**\n\n" +
                   "| Operation | Array | Linked List |\n" +
                   "|---|---|---|\n" +
                   "| Access by index | O(1) ✅ | O(n) ❌ |\n" +
                   "| Insert at beginning | O(n) ❌ | O(1) ✅ |\n" +
                   "| Insert at end | O(1) amortized | O(n) or O(1) with tail pointer |\n" +
                   "| Delete from middle | O(n) | O(n) |\n" +
                   "| Memory | Contiguous block | Non-contiguous (extra pointer overhead) |\n\n" +
                   "**Use Array when:** You need frequent random access, fixed size, or cache-friendly traversal.\n" +
                   "**Use Linked List when:** You need frequent insertions/deletions at the beginning.";
        }

        if (contains(lastMessage, "binary search") || (contains(lastMessage, "binary") && contains(lastMessage, "search"))) {
            return "**Binary Search** finds a target in a sorted array in O(log n) time.\n\n" +
                   "**Algorithm:**\n" +
                   "1. Set `left = 0`, `right = array.length - 1`.\n" +
                   "2. While `left <= right`:\n" +
                   "   - `mid = (left + right) / 2`\n" +
                   "   - If `array[mid] == target` → return `mid`.\n" +
                   "   - If `array[mid] < target` → `left = mid + 1`.\n" +
                   "   - Else → `right = mid - 1`.\n" +
                   "3. Return -1 (not found).\n\n" +
                   "**Java implementation:**\n" +
                   "```java\n" +
                   "int binarySearch(int[] arr, int target) {\n" +
                   "    int left = 0, right = arr.length - 1;\n" +
                   "    while (left <= right) {\n" +
                   "        int mid = left + (right - left) / 2;\n" +
                   "        if (arr[mid] == target) return mid;\n" +
                   "        if (arr[mid] < target) left = mid + 1;\n" +
                   "        else right = mid - 1;\n" +
                   "    }\n" +
                   "    return -1;\n" +
                   "}\n" +
                   "```\n\n" +
                   "**Key requirement:** The array MUST be sorted. Time: O(log n), Space: O(1).";
        }

        if (contains(lastMessage, "dynamic programming") || contains(lastMessage, "dp")) {
            return "**Dynamic Programming (DP)** solves complex problems by breaking them into overlapping subproblems and storing results to avoid recomputation.\n\n" +
                   "**Two approaches:**\n" +
                   "1. **Top-down (Memoization):** Recursion + cache results.\n" +
                   "2. **Bottom-up (Tabulation):** Build up from smallest subproblems.\n\n" +
                   "**Classic example — Fibonacci:**\n" +
                   "```java\n" +
                   "// Memoization (top-down)\n" +
                   "int fib(int n, int[] memo) {\n" +
                   "    if (n <= 1) return n;\n" +
                   "    if (memo[n] != 0) return memo[n];\n" +
                   "    return memo[n] = fib(n-1, memo) + fib(n-2, memo);\n" +
                   "}\n\n" +
                   "// Tabulation (bottom-up)\n" +
                   "int fib(int n) {\n" +
                   "    int[] dp = new int[n+1];\n" +
                   "    dp[0] = 0; dp[1] = 1;\n" +
                   "    for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];\n" +
                   "    return dp[n];\n" +
                   "}\n" +
                   "```\n\n" +
                   "**Common DP problems:** Knapsack, Longest Common Subsequence, Coin Change, Longest Increasing Subsequence.";
        }

        if (contains(lastMessage, "stack") || contains(lastMessage, "queue")) {
            return "**Stack & Queue — Linear Data Structures**\n\n" +
                   "**Stack (LIFO — Last In First Out):**\n" +
                   "- `push()` — add element to top.\n" +
                   "- `pop()` — remove element from top.\n" +
                   "- `peek()` — view top without removing.\n" +
                   "- Uses: Function call stack, undo operations, balanced parentheses.\n\n" +
                   "**Queue (FIFO — First In First Out):**\n" +
                   "- `enqueue()` — add to rear.\n" +
                   "- `dequeue()` — remove from front.\n" +
                   "- Uses: BFS traversal, scheduling, print spooler.\n\n" +
                   "**Java:**\n" +
                   "```java\n" +
                   "Deque<Integer> stack = new ArrayDeque<>();\n" +
                   "stack.push(1); stack.push(2);\n" +
                   "stack.pop();   // 2\n\n" +
                   "Queue<Integer> queue = new LinkedList<>();\n" +
                   "queue.offer(1); queue.offer(2);\n" +
                   "queue.poll();  // 1\n" +
                   "```";
        }

        if (contains(lastMessage, "dsa") || (contains(lastMessage, "data structure") && contains(lastMessage, "algorithm"))) {
            return "**Data Structures & Algorithms — Placement Roadmap**\n\n" +
                   "**Essential topics to master:**\n\n" +
                   "1. **Arrays & Strings** — two pointers, sliding window, prefix sum.\n" +
                   "2. **Linked List** — reversal, cycle detection, merge.\n" +
                   "3. **Stack & Queue** — balanced parentheses, next greater element.\n" +
                   "4. **Trees** — BFS/DFS, BST operations, LCA, height.\n" +
                   "5. **Graphs** — BFS, DFS, Dijkstra, topological sort, Union-Find.\n" +
                   "6. **Sorting** — Merge sort O(n log n), Quick sort, counting sort.\n" +
                   "7. **Binary Search** — search on answer, rotated array.\n" +
                   "8. **Dynamic Programming** — Knapsack, LCS, Coin Change.\n" +
                   "9. **Hashing** — HashMap tricks for O(1) lookups.\n" +
                   "10. **Recursion & Backtracking** — permutations, N-Queens.\n\n" +
                   "Ask me about any specific topic for a deeper explanation!";
        }

        // ── Python ────────────────────────────────────────────────────────────
        if (contains(lastMessage, "python")) {
            return "**Python — Key Concepts for Placements**\n\n" +
                   "**Core topics:**\n\n" +
                   "1. **Data types:** `list`, `tuple`, `dict`, `set`.\n" +
                   "2. **Comprehensions:** `[x*2 for x in range(10) if x % 2 == 0]`\n" +
                   "3. **Functions:** `def`, `lambda`, `*args`, `**kwargs`, decorators.\n" +
                   "4. **OOP:** Classes, `__init__`, `self`, inheritance, dunder methods.\n" +
                   "5. **File I/O:** `with open('file.txt') as f: data = f.read()`\n" +
                   "6. **Error handling:** `try / except / finally`.\n" +
                   "7. **Libraries:** NumPy, Pandas (data science); Flask/FastAPI (web).\n\n" +
                   "**Quick example — list comprehension:**\n" +
                   "```python\n" +
                   "squares = [x**2 for x in range(1, 6)]\n" +
                   "# [1, 4, 9, 16, 25]\n" +
                   "```\n\n" +
                   "Ask me about any specific Python topic!";
        }

        // ── Web Development ───────────────────────────────────────────────────
        if (contains(lastMessage, "react") || contains(lastMessage, "reactjs")) {
            return "**React.js — Key Concepts**\n\n" +
                   "React is a JavaScript library for building UI components.\n\n" +
                   "**Core concepts:**\n" +
                   "- **Component:** A function returning JSX.\n" +
                   "- **Props:** Data passed from parent to child (read-only).\n" +
                   "- **State:** Local data managed inside a component (`useState`).\n" +
                   "- **Hooks:** `useState`, `useEffect`, `useRef`, `useContext`, `useMemo`.\n" +
                   "- **Virtual DOM:** React diffs a virtual copy of the DOM to batch updates efficiently.\n\n" +
                   "```jsx\n" +
                   "function Counter() {\n" +
                   "  const [count, setCount] = useState(0);\n" +
                   "  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n" +
                   "}\n" +
                   "```\n\n" +
                   "**Key interview questions:** What is the difference between `useEffect` and `useLayoutEffect`? Explain React's reconciliation algorithm.";
        }

        if (contains(lastMessage, "html") || contains(lastMessage, "css") || contains(lastMessage, "javascript") || contains(lastMessage, "js")) {
            return "**Web Development Fundamentals**\n\n" +
                   "**HTML** — Structure of a web page.\n" +
                   "- Semantic tags: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`.\n" +
                   "- Forms, tables, inputs, accessibility (`alt`, `aria-label`).\n\n" +
                   "**CSS** — Styling and layout.\n" +
                   "- Box model: `margin > border > padding > content`.\n" +
                   "- Layouts: Flexbox and CSS Grid.\n" +
                   "- Responsive: Media queries, `rem`/`em` units.\n\n" +
                   "**JavaScript** — Behaviour and interactivity.\n" +
                   "- ES6+: `let`/`const`, arrow functions, destructuring, spread, modules.\n" +
                   "- Async: Promises, `async/await`, `fetch` API.\n" +
                   "- DOM: `querySelector`, `addEventListener`, event bubbling.\n" +
                   "- Closures, hoisting, `this` keyword, prototypal inheritance.\n\n" +
                   "Ask me about any specific web concept!";
        }

        // ── System Design ─────────────────────────────────────────────────────
        if (contains(lastMessage, "system design") || contains(lastMessage, "design pattern") || contains(lastMessage, "microservice")) {
            return "**System Design — Interview Guide**\n\n" +
                   "**Common design patterns:**\n" +
                   "- **Singleton** — Only one instance of a class.\n" +
                   "- **Factory** — Delegate object creation to a factory method.\n" +
                   "- **Observer** — Notify multiple objects when state changes.\n" +
                   "- **Strategy** — Swap algorithms at runtime.\n" +
                   "- **Builder** — Construct complex objects step by step.\n\n" +
                   "**Microservices principles:**\n" +
                   "- Single Responsibility, Loose Coupling, High Cohesion.\n" +
                   "- Communication: REST, gRPC, message queues (Kafka, RabbitMQ).\n" +
                   "- Service discovery (Eureka), API Gateway, Circuit Breaker (Resilience4j).\n\n" +
                   "**System design interview steps:**\n" +
                   "1. Clarify requirements and scale.\n" +
                   "2. Define API contract.\n" +
                   "3. Choose database (SQL vs NoSQL).\n" +
                   "4. Design high-level architecture.\n" +
                   "5. Deep dive into critical components.\n" +
                   "6. Discuss trade-offs.";
        }

        // ── OS / Networking ───────────────────────────────────────────────────
        if (contains(lastMessage, "operating system") || contains(lastMessage, " os ") ||
            contains(lastMessage, "process") || contains(lastMessage, "thread vs process")) {
            return "**Operating Systems — Key Concepts**\n\n" +
                   "**Process vs Thread:**\n" +
                   "- A **process** is an independent program in execution (own memory space).\n" +
                   "- A **thread** is a lightweight sub-unit of a process (shared memory).\n\n" +
                   "**Topics to know:**\n" +
                   "- **CPU Scheduling:** FCFS, SJF, Round Robin, Priority.\n" +
                   "- **Deadlock:** Mutual exclusion, hold & wait, no preemption, circular wait.\n" +
                   "- **Memory management:** Paging, segmentation, virtual memory, page replacement (LRU, FIFO).\n" +
                   "- **Synchronization:** Mutex, semaphore, monitors, race condition.\n" +
                   "- **File system:** Inodes, directories, file allocation strategies.\n\n" +
                   "These are frequently tested in system-level and SDE interviews.";
        }

        // ── Career & Placement ────────────────────────────────────────────────
        if (contains(lastMessage, "resume") || contains(lastMessage, "cv")) {
            return "**Resume Tips for Campus Placements**\n\n" +
                   "1. **Keep it to 1 page** (for freshers).\n" +
                   "2. **Use action verbs:** Developed, Implemented, Optimized, Led.\n" +
                   "3. **Quantify achievements:** 'Reduced load time by 40%' beats 'Improved performance'.\n" +
                   "4. **Sections to include:** Contact info → Summary → Education → Skills → Projects → Experience (if any) → Certifications.\n" +
                   "5. **ATS keywords:** Match job description keywords in your resume.\n" +
                   "6. **Projects:** Include 2–3 solid projects with tech stack, problem solved, and your contribution.\n" +
                   "7. **Skills:** Be honest — only list tools you can discuss in an interview.\n\n" +
                   "**Common mistakes:** Spelling errors, irrelevant personal info, unprofessional email, missing GitHub/LinkedIn links.\n\n" +
                   "Use the Resume Analyzer on PrepEdge for an AI-powered score and suggestions!";
        }

        if (contains(lastMessage, "interview") && (contains(lastMessage, "tip") || contains(lastMessage, "prepare") || contains(lastMessage, "how"))) {
            return "**Interview Preparation Tips**\n\n" +
                   "**Technical Round:**\n" +
                   "- Practice 150+ LeetCode problems (Easy + Medium).\n" +
                   "- Focus on: Arrays, Strings, HashMap, Trees, DP.\n" +
                   "- Time yourself — aim to solve mediums in 20–25 minutes.\n" +
                   "- Always think aloud; explain your approach before coding.\n\n" +
                   "**Communication:**\n" +
                   "- Repeat the problem to confirm understanding.\n" +
                   "- Discuss brute force first, then optimize.\n" +
                   "- Write clean code with meaningful variable names.\n" +
                   "- Test your solution with examples before submitting.\n\n" +
                   "**HR Round:**\n" +
                   "- Prepare STAR answers (Situation, Task, Action, Result).\n" +
                   "- Common questions: Tell me about yourself, strengths/weaknesses, why this company?\n" +
                   "- Research the company's products, values, and recent news.\n\n" +
                   "**PrepEdge resources:** Use Mock Interview, Quizzes, and AI Coach for practice!";
        }

        // ── Default educational response ──────────────────────────────────────
        return "I'm your **PrepEdge AI Coach** — here to help you with placement preparation! 🎓\n\n" +
               "I can explain concepts in:\n\n" +
               "☕ **Java** — OOP, Collections, Multithreading, Spring Boot\n" +
               "🐍 **Python** — Syntax, data structures, libraries\n" +
               "🗄️ **SQL / DBMS** — Joins, normalization, transactions\n" +
               "📊 **DSA** — Arrays, Trees, Graphs, DP, Sorting, Searching\n" +
               "🌐 **Web Dev** — HTML, CSS, JavaScript, React\n" +
               "🏗️ **System Design** — Microservices, design patterns\n" +
               "💼 **Career** — Resume tips, interview preparation, HR questions\n\n" +
               "Try asking:\n" +
               "- *\"What is encapsulation in Java?\"*\n" +
               "- *\"Explain SQL joins with an example.\"*\n" +
               "- *\"How do I prepare for a Java interview?\"*\n" +
               "- *\"Explain dynamic programming.\"*\n\n" +
               "What would you like to learn about?";
    }

    /** Generates 5 numbered interview questions for the given topic and difficulty */
    private String generateMockInterviewQuestions(String prompt) {
        // Detect topic from the prompt (prompt is already lowercased)
        String topic = "general";
        if (prompt.contains("javascript") || prompt.contains("js")) topic = "javascript";
        else if (prompt.contains("java") && !prompt.contains("javascript")) topic = "java";
        else if (prompt.contains("python")) topic = "python";
        else if (prompt.contains("react")) topic = "react";
        else if (prompt.contains("sql")) topic = "sql";
        else if (prompt.contains("dbms") || prompt.contains("database")) topic = "dbms";
        else if (prompt.contains("dsa") || prompt.contains("data structure")) topic = "dsa";
        else if (prompt.contains("system design")) topic = "systemdesign";
        else if (prompt.contains("network")) topic = "networks";
        else if (prompt.contains("machine learning") || prompt.contains("ml ")) topic = "ml";
        else if (prompt.contains("oop") || prompt.contains("oops") || prompt.contains("object orient")) topic = "oop";
        else if (prompt.contains("operating system") || prompt.contains(": os") || prompt.contains("topic: os")
                 || prompt.endsWith(" os") || prompt.contains(" os\n") || prompt.contains(" os ")) topic = "os";

        // Detect difficulty
        boolean easy = prompt.contains("easy");
        boolean hard = prompt.contains("hard");
        // medium is the default

        return buildQuestionsText(topic, easy, hard);
    }

    private String buildQuestionsText(String topic, boolean easy, boolean hard) {
        Map<String, String[][]> bank = new LinkedHashMap<>();

        // Format: [easy[5], medium[5], hard[5]] each entry is a question string
        bank.put("java", new String[][] {
            { // EASY
                "What is Java and what are its main features?",
                "What is the difference between JDK, JRE, and JVM?",
                "What is inheritance in Java? Give an example.",
                "What is method overloading in Java?",
                "What is encapsulation and how is it achieved in Java?"
            },
            { // MEDIUM
                "What is the difference between an abstract class and an interface in Java?",
                "Explain the Java Collections Framework. Compare ArrayList vs LinkedList.",
                "What are checked and unchecked exceptions in Java? Give examples.",
                "Explain the concept of generics in Java with an example.",
                "What is the difference between HashMap and Hashtable in Java?"
            },
            { // HARD
                "Explain Java memory model and how the JVM manages heap and stack memory.",
                "What is the difference between synchronized, volatile, and AtomicInteger in Java concurrency?",
                "How does the Java garbage collector work? Explain G1GC vs ZGC.",
                "Explain Java 8 Streams API. How does lazy evaluation work with filter and map?",
                "How would you implement a thread-safe Singleton in Java? Show multiple approaches."
            }
        });

        bank.put("python", new String[][] {
            { // EASY
                "What is Python and what are its key features?",
                "What is the difference between a list and a tuple in Python?",
                "How do you handle exceptions in Python? Give an example.",
                "What are Python decorators and how are they used?",
                "What is the difference between '==' and 'is' in Python?"
            },
            { // MEDIUM
                "Explain list comprehensions in Python with examples. When would you use them?",
                "What are *args and **kwargs in Python? When would you use them?",
                "Explain Python's GIL (Global Interpreter Lock) and its implications.",
                "What is the difference between a generator and an iterator in Python?",
                "How does Python manage memory? Explain reference counting and garbage collection."
            },
            { // HARD
                "Explain Python's metaclasses. When and why would you use them?",
                "How do you achieve true parallelism in Python given the GIL? Compare multiprocessing vs threading.",
                "Explain Python's descriptor protocol (__get__, __set__, __delete__).",
                "How does Python's asyncio event loop work? Write an async HTTP fetcher.",
                "Explain the difference between shallow copy and deep copy in Python with edge cases."
            }
        });

        bank.put("javascript", new String[][] {
            { // EASY
                "What is JavaScript and how is it different from Java?",
                "What is the difference between var, let, and const in JavaScript?",
                "What are JavaScript data types? Give examples of each.",
                "What is a closure in JavaScript? Give a simple example.",
                "What is the difference between == and === in JavaScript?"
            },
            { // MEDIUM
                "Explain JavaScript's event loop and how asynchronous code works.",
                "What is a Promise in JavaScript? How is it different from a callback?",
                "Explain 'this' keyword in JavaScript with examples in different contexts.",
                "What is prototypal inheritance in JavaScript? How does it differ from classical inheritance?",
                "What are higher-order functions in JavaScript? Give examples using map, filter, reduce."
            },
            { // HARD
                "Explain JavaScript's memory management and common memory leaks patterns.",
                "What is the difference between microtasks and macrotasks in the JS event loop?",
                "Explain how JavaScript modules (ES Modules vs CommonJS) work and their differences.",
                "How does the V8 engine optimize JavaScript code? Explain JIT compilation.",
                "Implement a debounce and throttle function from scratch and explain the difference."
            }
        });

        bank.put("react", new String[][] {
            { // EASY
                "What is React and what problem does it solve?",
                "What is JSX in React? How is it different from HTML?",
                "What is the difference between state and props in React?",
                "What is the virtual DOM and how does React use it?",
                "What are React hooks? Name and describe three common hooks."
            },
            { // MEDIUM
                "Explain React's useEffect hook. When does it run and how do you clean up?",
                "What is the difference between controlled and uncontrolled components in React?",
                "How does React's Context API work? When would you use it over prop drilling?",
                "Explain React.memo, useMemo, and useCallback — when should you use each?",
                "What is the React reconciliation algorithm and how does the key prop affect it?"
            },
            { // HARD
                "Explain React's concurrent mode and the Fiber architecture. What problems do they solve?",
                "How would you implement a custom hook for debounced search? Write the code.",
                "Explain the trade-offs between server-side rendering (SSR), static site generation (SSG), and client-side rendering (CSR) in React.",
                "How do you prevent unnecessary re-renders in large React applications? List all techniques.",
                "Explain React Suspense and React.lazy. How does error boundary work with Suspense?"
            }
        });

        bank.put("sql", new String[][] {
            { // EASY
                "What is SQL and what are DDL, DML, and DCL commands?",
                "What is the difference between WHERE and HAVING clause in SQL?",
                "Explain the different types of SQL joins with examples.",
                "What is a primary key and a foreign key in SQL?",
                "What is the difference between DELETE, TRUNCATE, and DROP in SQL?"
            },
            { // MEDIUM
                "Explain normalization in SQL. What are 1NF, 2NF, and 3NF?",
                "What is an index in SQL and how does it improve performance? What are the trade-offs?",
                "What are SQL subqueries and CTEs (WITH clause)? When would you use each?",
                "Explain ACID properties in database transactions with examples.",
                "What is the difference between UNION and UNION ALL? When would you use each?"
            },
            { // HARD
                "Explain query optimization in SQL. How does the query planner work?",
                "What are window functions in SQL? Write a query to calculate a running total.",
                "Explain different isolation levels in SQL transactions and the problems they solve.",
                "How would you design a schema for a social media platform? Consider scalability.",
                "What is database sharding? How does it differ from replication and partitioning?"
            }
        });

        bank.put("dbms", new String[][] {
            { // EASY
                "What is a DBMS and how is it different from a file system?",
                "What is the difference between a relational and a non-relational database?",
                "What is an entity-relationship (ER) diagram and what are its components?",
                "What is data redundancy and how does normalization help reduce it?",
                "What are the advantages of using a DBMS over flat files?"
            },
            { // MEDIUM
                "Explain the ACID properties of database transactions with examples.",
                "What are different types of keys in DBMS: primary, candidate, super, and foreign keys?",
                "What is the difference between a view and a materialized view in a database?",
                "Explain the concept of database indexing. What is a B-Tree index?",
                "What are stored procedures and triggers? When would you use each?"
            },
            { // HARD
                "Explain the CAP theorem and its implications for distributed databases.",
                "What is the difference between optimistic and pessimistic concurrency control?",
                "Explain database deadlock — how it occurs and how it can be prevented or resolved.",
                "What are the different normal forms up to BCNF and how do you identify violations?",
                "How does a database implement transaction isolation using MVCC (Multi-Version Concurrency Control)?"
            }
        });

        bank.put("dsa", new String[][] {
            { // EASY
                "What is Big O notation? What is the time complexity of binary search?",
                "Explain the difference between a stack and a queue with real-world examples.",
                "What is a linked list and how does it differ from an array?",
                "What is a binary search tree (BST) and what are its properties?",
                "Explain bubble sort. What is its time complexity in the best and worst case?"
            },
            { // MEDIUM
                "Explain BFS and DFS graph traversal algorithms. What are their use cases?",
                "What is dynamic programming? Solve the coin change problem using DP.",
                "Explain the two-pointer technique and give two examples where it applies.",
                "What is a heap data structure? Explain min-heap and max-heap operations.",
                "Explain the sliding window technique. Give an example of finding the maximum sum subarray of size k."
            },
            { // HARD
                "Explain Dijkstra's shortest path algorithm and its time complexity.",
                "What is a segment tree? How would you use it for range minimum queries?",
                "Explain the knapsack problem and provide both recursive and DP solutions.",
                "What is a trie (prefix tree)? Implement insert and search operations.",
                "Explain topological sorting. How would you detect a cycle in a directed graph?"
            }
        });

        bank.put("systemdesign", new String[][] {
            { // EASY
                "What is the difference between horizontal and vertical scaling?",
                "What is a load balancer and why is it used?",
                "What is caching and how does it improve system performance?",
                "What is the difference between SQL and NoSQL databases? Give examples of when to use each.",
                "What is an API Gateway and what role does it play in microservices?"
            },
            { // MEDIUM
                "Design a URL shortener like bit.ly. Describe the key components and database schema.",
                "Explain the CAP theorem. How do you choose between consistency and availability?",
                "What are the differences between REST, GraphQL, and gRPC? When would you use each?",
                "How would you design a rate limiter? Describe the token bucket algorithm.",
                "Explain the difference between synchronous and asynchronous communication in microservices."
            },
            { // HARD
                "Design a distributed message queue like Kafka. How does it achieve fault tolerance?",
                "How would you design a global content delivery network (CDN)?",
                "Design a real-time chat application. How would you handle 10 million concurrent users?",
                "How does Google's Spanner achieve global consistency across data centers?",
                "Design a ride-sharing system like Uber. Focus on the matching and location tracking components."
            }
        });

        bank.put("networks", new String[][] {
            { // EASY
                "What is the OSI model? Name the 7 layers and their functions.",
                "What is the difference between TCP and UDP? When would you use each?",
                "What is an IP address and what is the difference between IPv4 and IPv6?",
                "What is DNS and how does domain name resolution work?",
                "What is the difference between a hub, switch, and router?"
            },
            { // MEDIUM
                "Explain the TCP three-way handshake and four-way termination process.",
                "What is HTTP vs HTTPS? How does SSL/TLS work?",
                "What is the difference between a firewall and a proxy server?",
                "Explain how ARP (Address Resolution Protocol) works.",
                "What is NAT (Network Address Translation) and why is it needed?"
            },
            { // HARD
                "Explain BGP (Border Gateway Protocol) and how routing decisions are made on the internet.",
                "What is the difference between congestion control and flow control in TCP?",
                "How does HTTPS prevent man-in-the-middle attacks? Explain the certificate chain.",
                "Explain how CDN (Content Delivery Network) reduces latency globally.",
                "What are the security vulnerabilities in the original DNS protocol and how does DNSSEC address them?"
            }
        });

        bank.put("os", new String[][] {
            { // EASY
                "What is an operating system and what are its main functions?",
                "What is the difference between a process and a thread?",
                "What is a deadlock? Name the four necessary conditions for a deadlock.",
                "What is virtual memory and why is it useful?",
                "What is the difference between preemptive and non-preemptive scheduling?"
            },
            { // MEDIUM
                "Explain the different CPU scheduling algorithms: FCFS, SJF, Round Robin, and Priority.",
                "What is the dining philosophers problem? How can it be solved using semaphores?",
                "Explain paging in OS. How does a virtual address get translated to a physical address?",
                "What is a context switch? What are the costs associated with it?",
                "Explain the producer-consumer problem and how to solve it with a bounded buffer."
            },
            { // HARD
                "Explain the Banker's Algorithm for deadlock avoidance.",
                "How does the Linux kernel implement the Completely Fair Scheduler (CFS)?",
                "Explain page replacement algorithms: FIFO, LRU, and Optimal. Compare their performance.",
                "What is the difference between kernel-level threads and user-level threads?",
                "Explain inter-process communication (IPC) mechanisms: pipes, message queues, shared memory, and sockets."
            }
        });

        bank.put("ml", new String[][] {
            { // EASY
                "What is machine learning and what are the three main types?",
                "What is the difference between supervised and unsupervised learning?",
                "What is overfitting and underfitting? How can they be detected?",
                "What is a feature in machine learning? What is feature engineering?",
                "What is the difference between a classification and a regression problem?"
            },
            { // MEDIUM
                "Explain gradient descent and its variants: batch, mini-batch, and stochastic.",
                "What is regularization in ML? Explain L1 (Lasso) and L2 (Ridge) regularization.",
                "How does a decision tree work? What are the criteria for splitting nodes?",
                "What is cross-validation? Why is it important for model evaluation?",
                "Explain the bias-variance tradeoff in machine learning."
            },
            { // HARD
                "Explain the backpropagation algorithm in neural networks step by step.",
                "What is the vanishing gradient problem? How do LSTM and ResNets address it?",
                "Explain how a Support Vector Machine (SVM) finds the optimal hyperplane.",
                "What is attention mechanism in transformers? How does self-attention work?",
                "How does XGBoost differ from random forests? Explain gradient boosting."
            }
        });

        bank.put("oop", new String[][] {
            { // EASY
                "What are the four pillars of Object-Oriented Programming?",
                "What is the difference between a class and an object?",
                "What is inheritance? Give a real-world example.",
                "What is method overloading vs method overriding?",
                "What is encapsulation and what are access modifiers?"
            },
            { // MEDIUM
                "What is the difference between an abstract class and an interface?",
                "Explain the SOLID principles of object-oriented design.",
                "What is polymorphism? Explain compile-time vs runtime polymorphism.",
                "What is composition vs inheritance? When would you prefer one over the other?",
                "Explain the Singleton design pattern. What are its drawbacks?"
            },
            { // HARD
                "Explain the Liskov Substitution Principle with a violation example and fix.",
                "What is the difference between the Factory, Abstract Factory, and Builder patterns?",
                "Explain how the Observer pattern works and implement it in Java.",
                "What is the Open/Closed Principle? Give an example of applying it to a real system.",
                "How does dependency injection relate to the Dependency Inversion Principle? Give examples."
            }
        });

        // Default / General questions
        bank.put("general", new String[][] {
            { // EASY
                "Describe your technical background and the languages you are most comfortable with.",
                "What is the difference between compiled and interpreted languages?",
                "What is version control and why is it important in software development?",
                "Explain the difference between frontend and backend development.",
                "What is REST API and how does it work?"
            },
            { // MEDIUM
                "What is the MVC architecture pattern? Give an example of how it is used.",
                "How would you approach debugging a complex bug in production?",
                "Explain microservices vs monolithic architecture. What are the trade-offs?",
                "What is CI/CD and how does it benefit a development team?",
                "How do you ensure code quality in a team project?"
            },
            { // HARD
                "Design a scalable notification system for 10 million users. Walk through the architecture.",
                "How would you migrate a monolith to microservices with zero downtime?",
                "Explain CAP theorem and how it applies to real-world distributed systems you have used.",
                "How would you handle a database migration for a live system with millions of records?",
                "Walk me through the system design of a feature you are proud of. What trade-offs did you make?"
            }
        });

        String[][] questions = bank.getOrDefault(topic, bank.get("general"));
        String[] selectedQuestions;
        if (easy) {
            selectedQuestions = questions[0];
        } else if (hard) {
            selectedQuestions = questions[2];
        } else {
            selectedQuestions = questions[1]; // MEDIUM default
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < selectedQuestions.length; i++) {
            sb.append(i + 1).append(". ").append(selectedQuestions[i]).append("\n");
        }
        return sb.toString().trim();
    }

    /** Parses the evaluation prompt lines and invokes mock evaluation */
    private String parseAndGenerateMockEvaluation(String content) {
        String topic = "General";
        String question = "";
        String answer = "";

        if (content != null) {
            String[] lines = content.split("\n");
            StringBuilder answerBuilder = new StringBuilder();
            boolean capturingAnswer = false;

            for (String line : lines) {
                String trimmed = line.trim();
                String lower = trimmed.toLowerCase();
                if (lower.startsWith("topic:")) {
                    topic = trimmed.substring(6).trim();
                } else if (lower.startsWith("question:")) {
                    question = trimmed.substring(9).trim();
                } else if (lower.startsWith("candidate's answer:")) {
                    capturingAnswer = true;
                    String firstPart = trimmed.substring(19).trim();
                    if (!firstPart.isEmpty()) {
                        answerBuilder.append(firstPart);
                    }
                } else if (capturingAnswer) {
                    if (answerBuilder.length() > 0) answerBuilder.append("\n");
                    answerBuilder.append(line);
                }
            }
            answer = answerBuilder.toString().trim();
        }

        return generateMockEvaluation(question, answer, topic);
    }

    private static class ConceptEvaluation {
        final String conceptName;
        final String[] keywords;
        final String keyPointsExpected;
        final String modelAnswer;

        ConceptEvaluation(String conceptName, String[] keywords, String keyPointsExpected, String modelAnswer) {
            this.conceptName = conceptName;
            this.keywords = keywords;
            this.keyPointsExpected = keyPointsExpected;
            this.modelAnswer = modelAnswer;
        }
    }

    /**
     * Generates individualized, topic- and question-aware evaluation feedback.
     * Evaluates candidate's actual answer, detects missing elements, and produces realistic scoring.
     */
    private String generateMockEvaluation(String question, String answer, String topic) {
        String q = (question != null) ? question.trim() : "";
        String a = (answer != null) ? answer.trim() : "";
        String top = (topic != null && !topic.isBlank()) ? topic.trim() : "General";
        String qLower = q.toLowerCase();
        String aLower = a.toLowerCase();

        boolean isBlank = a.isEmpty()
                || a.equalsIgnoreCase("no answer provided")
                || a.equalsIgnoreCase("(no answer provided)")
                || a.equalsIgnoreCase("none")
                || a.equalsIgnoreCase("n/a")
                || a.equalsIgnoreCase("idk")
                || a.equalsIgnoreCase("i don't know");

        boolean asksForExample = qLower.contains("example")
                || qLower.contains("give an example")
                || qLower.contains("provide an example");

        boolean gaveExample = aLower.contains("for example")
                || aLower.contains("for instance")
                || aLower.contains("e.g.")
                || aLower.contains("example:")
                || aLower.contains("example :")
                || a.contains("public class")
                || (a.contains("class ") && a.contains("{"))
                || (a.contains("def ") && a.contains(":"))
                || a.contains("function ")
                || (a.contains("const ") && a.contains("="));

        ConceptEvaluation concept = findConceptEvaluation(qLower, top);

        // ── 1. CASE: No Answer Provided ──────────────────────────────────────
        if (isBlank) {
            StringBuilder sb = new StringBuilder();
            sb.append("Score: 0/10 — No Answer Provided\n\n");
            sb.append("⚠️ Feedback:\n");
            sb.append("You did not provide an answer for this question. In an interview, always make an attempt or walk through your reasoning rather than leaving the question blank.\n\n");
            if (concept != null) {
                sb.append("💡 Key Points That Were Expected:\n");
                sb.append("- ").append(concept.keyPointsExpected).append("\n\n");
                sb.append("🎯 Model Answer:\n");
                sb.append(concept.modelAnswer);
            } else {
                sb.append("💡 How to Approach This Question:\n");
                sb.append("- Define the fundamental concept clearly.\n");
                sb.append("- Explain how and why it is used in software development.\n");
                sb.append("- Provide a concrete example or mention trade-offs.\n\n");
                sb.append("🎯 Model Answer:\n");
                sb.append("A strong response should state the primary definition, walk through its core mechanism, and illustrate with a relevant use case or code snippet.");
            }
            return sb.toString();
        }

        // ── 2. CASE: Answer Is Provided — Evaluate Content & Depth ────────────
        int wordCount = a.split("\\s+").length;
        List<String> matchedKeywords = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();

        if (concept != null) {
            for (String kw : concept.keywords) {
                if (aLower.contains(kw.toLowerCase())) {
                    matchedKeywords.add(kw);
                } else {
                    missingKeywords.add(kw);
                }
            }
        }

        // Determine score dynamically based on depth, accuracy, and completeness
        int score;
        if (wordCount < 10) {
            score = asksForExample ? 3 : 4;
        } else if (wordCount < 25) {
            score = (asksForExample && !gaveExample) ? 5 : (matchedKeywords.size() >= 2 ? 6 : 5);
        } else if (wordCount < 60) {
            if (asksForExample && !gaveExample) {
                score = 6;
            } else {
                score = matchedKeywords.size() >= 2 ? 7 : 6;
            }
        } else {
            // Detailed answer (> 60 words)
            if (asksForExample && !gaveExample) {
                score = 7;
            } else {
                score = matchedKeywords.size() >= 3 ? 9 : 8;
            }
        }

        // Build personalized feedback
        StringBuilder sb = new StringBuilder();
        if (score >= 8) {
            sb.append("Score: ").append(score).append("/10 — Excellent Answer!\n\n");
        } else if (score >= 6) {
            sb.append("Score: ").append(score).append("/10 — Good Answer\n\n");
        } else {
            sb.append("Score: ").append(score).append("/10 — Needs More Depth\n\n");
        }

        // Strengths
        sb.append("✅ Strengths:\n");
        if (concept != null && !matchedKeywords.isEmpty()) {
            sb.append("- You demonstrated a good grasp of ").append(concept.conceptName)
              .append(", correctly mentioning: ").append(String.join(", ", matchedKeywords)).append(".\n");
        } else {
            sb.append("- You correctly identified the primary topic of the question.\n");
        }
        if (gaveExample) {
            sb.append("- Good effort providing a concrete example/scenario to support your explanation.\n");
        }
        if (wordCount >= 25) {
            sb.append("- Clear structure and communication in your response.\n");
        }
        sb.append("\n");

        // Areas for Improvement
        sb.append("⚠️ Areas for Improvement:\n");
        if (asksForExample && !gaveExample) {
            sb.append("- The question explicitly asked to 'Give an example', but your answer omitted one. In technical interviews, always provide a code snippet or practical scenario when asked.\n");
        }
        if (wordCount < 20) {
            sb.append("- Your answer was quite brief. Aim to explain the underlying mechanism, why it matters, and when to use it.\n");
        }
        if (concept != null && !missingKeywords.isEmpty() && missingKeywords.size() <= 4) {
            sb.append("- To make your answer more complete, consider mentioning: ")
              .append(String.join(", ", missingKeywords)).append(".\n");
        } else if (concept != null && missingKeywords.size() > 4) {
            sb.append("- Expand on: ").append(concept.keyPointsExpected).append(".\n");
        } else {
            sb.append("- Consider discussing edge cases, performance trade-offs, or real-world use cases to impress interviewers.\n");
        }
        sb.append("\n");

        // Model Answer
        sb.append("🎯 Model Answer:\n");
        if (concept != null) {
            sb.append(concept.modelAnswer);
        } else {
            sb.append("A complete answer to '").append(q).append("' should:\n")
              .append("1. Clearly define the term and its purpose.\n")
              .append("2. Explain the core mechanism or architecture.\n")
              .append("3. Provide a practical code example or architectural scenario.\n")
              .append("4. Mention key trade-offs or best practices.");
        }

        return sb.toString();
    }

    /** Matches question text to known interview concepts for rich, tailored mock evaluations */
    private ConceptEvaluation findConceptEvaluation(String qLower, String topic) {
        // ── Java / OOP ────────────────────────────────────────────────────────
        if (qLower.contains("inherit")) {
            return new ConceptEvaluation(
                "Inheritance",
                new String[] {"extends", "subclass", "superclass", "acquire", "code reuse", "polymorphism"},
                "Explain the IS-A relationship, code reusability, 'extends' keyword, and method overriding with an example.",
                "Inheritance allows a child class (subclass) to inherit fields and methods from a parent class (superclass) using the 'extends' keyword in Java. This promotes code reuse and runtime polymorphism.\n\n" +
                "Example:\n" +
                "class Animal { void eat() { System.out.println(\"Eating...\"); } }\n" +
                "class Dog extends Animal { void bark() { System.out.println(\"Barking...\"); } }"
            );
        }

        if (qLower.contains("encapsulat")) {
            return new ConceptEvaluation(
                "Encapsulation",
                new String[] {"private", "getter", "setter", "data hiding", "bundle"},
                "Explain bundling data and methods, declaring fields 'private', and providing public getters/setters for controlled access.",
                "Encapsulation is the OOP principle of bundling data (fields) and methods that operate on that data inside a single class, while restricting direct access to internal state using 'private' modifiers and exposing controlled access via public getters and setters."
            );
        }

        if (qLower.contains("overload") || qLower.contains("overrid") || qLower.contains("polymorph")) {
            return new ConceptEvaluation(
                "Method Overloading / Overriding",
                new String[] {"compile-time", "runtime", "signature", "same name", "parameters", "override"},
                "Distinguish compile-time polymorphism (overloading: same name, different parameters) from runtime polymorphism (overriding: subclass replaces parent implementation).",
                "Method Overloading is compile-time polymorphism where multiple methods in the same class share the same name but have different parameter lists (count or type). Method Overriding is runtime polymorphism where a subclass provides its own specific implementation of a method defined in its superclass using the @Override annotation."
            );
        }

        if (qLower.contains("jdk") || qLower.contains("jre") || qLower.contains("jvm")) {
            return new ConceptEvaluation(
                "JDK vs JRE vs JVM",
                new String[] {"bytecode", "virtual machine", "compiler", "javac", "runtime"},
                "Clearly separate the roles: JVM executes bytecode, JRE provides JVM + runtime libraries, and JDK provides JRE + developer tools (javac, debugger).",
                "JVM (Java Virtual Machine) executes compiled Java bytecode across platforms. JRE (Java Runtime Environment) bundles the JVM along with standard Java libraries to run programs. JDK (Java Development Kit) is the complete developer package containing the JRE, compiler (javac), debugger, and utilities needed to build Java programs."
            );
        }

        if (qLower.contains("what is java") || (qLower.contains("features") && (qLower.contains("java") || topic.equalsIgnoreCase("java")))) {
            return new ConceptEvaluation(
                "Java Features & Architecture",
                new String[] {"platform independent", "bytecode", "object-oriented", "garbage collection", "multithreaded"},
                "Mention platform independence ('Write Once, Run Anywhere' via bytecode/JVM), OOP design, automatic garbage collection, and multithreading.",
                "Java is a high-level, class-based, object-oriented language. Hallmark features include: 1) Platform Independence ('Write Once, Run Anywhere' via JVM bytecode), 2) Automatic Garbage Collection, 3) Strong Type Safety & Security, 4) Built-in Multithreading, and 5) Rich Standard API."
            );
        }

        if (qLower.contains("hashmap") || qLower.contains("concurrenthashmap")) {
            return new ConceptEvaluation(
                "HashMap vs ConcurrentHashMap",
                new String[] {"thread-safe", "synchronized", "lock", "bucket", "null key"},
                "Contrast thread-safety, locking granularity (CAS / bucket-level locks in ConcurrentHashMap vs unsynchronized HashMap), and null key support.",
                "HashMap is not thread-safe and permits one null key. ConcurrentHashMap is thread-safe, utilizing fine-grained bucket-level locks (synchronized and CAS operations in Java 8+) for concurrent access without locking the entire map, and does not permit null keys or values."
            );
        }

        if (qLower.contains("stream") || qLower.contains("lambda")) {
            return new ConceptEvaluation(
                "Java Streams and Lambdas",
                new String[] {"functional", "filter", "map", "pipeline", "lazy evaluation"},
                "Explain functional interfaces, concise lambda syntax, declarative pipeline processing (filter, map, reduce), and lazy evaluation.",
                "Introduced in Java 8, Lambdas enable functional programming with concise syntax. Streams provide a declarative pipeline for processing sequences of elements (filter, map, sorted, collect), supporting lazy evaluation and effortless parallelization with .parallelStream()."
            );
        }

        if (qLower.contains("comparable") || qLower.contains("comparator")) {
            return new ConceptEvaluation(
                "Comparable vs Comparator",
                new String[] {"compareto", "compare", "natural ordering", "custom", "java.lang", "java.util"},
                "Distinguish single natural sorting (Comparable.compareTo in java.lang) from multiple custom sorting strategies (Comparator.compare in java.util).",
                "Comparable is implemented by a class to define its natural ordering using compareTo(T o) in java.lang. Comparator is implemented externally (compare(T o1, T o2) in java.util) to provide multiple custom sorting strategies without modifying the original class."
            );
        }

        if (qLower.contains("garbage") || qLower.contains("reclaim memory") || qLower.contains("gc")) {
            return new ConceptEvaluation(
                "Garbage Collection in Java",
                new String[] {"heap", "mark and sweep", "unreachable", "eden", "survivor", "tenured"},
                "Explain generational heap management (Young: Eden/Survivor, Old/Tenured) and the mark-and-sweep process for reclaiming unreachable objects.",
                "Java Garbage Collection automatically reclaims heap memory occupied by unreachable objects. It uses generational collection: new objects are allocated in Eden, survive minor GCs into Survivor spaces, and are promoted to the Old generation where major GCs (using G1 or ZGC) run."
            );
        }

        if (qLower.contains("stringbuilder") || qLower.contains("stringbuffer")) {
            return new ConceptEvaluation(
                "String vs StringBuilder vs StringBuffer",
                new String[] {"immutable", "mutable", "thread-safe", "synchronized", "performance"},
                "Clarify String immutability vs StringBuilder (mutable, unsynchronized, fastest) vs StringBuffer (mutable, synchronized, thread-safe).",
                "String is immutable — every modification creates a new object. StringBuilder is mutable and not thread-safe, making it the fastest for single-threaded string concatenation. StringBuffer is mutable and thread-safe because its methods are synchronized."
            );
        }

        // ── SQL / Databases ───────────────────────────────────────────────────
        if (qLower.contains("ddl") || qLower.contains("dml")) {
            return new ConceptEvaluation(
                "SQL DDL vs DML",
                new String[] {"create", "alter", "drop", "insert", "update", "delete", "schema"},
                "Contrast schema structure commands (DDL: CREATE, ALTER, DROP) with data record manipulations (DML: INSERT, UPDATE, DELETE).",
                "DDL (Data Definition Language) commands like CREATE, ALTER, and DROP define and modify table structures and database schema. DML (Data Manipulation Language) commands like SELECT, INSERT, UPDATE, and DELETE operate on the actual data rows stored within those tables."
            );
        }

        if (qLower.contains("join")) {
            return new ConceptEvaluation(
                "SQL Joins",
                new String[] {"inner join", "left join", "right join", "full outer", "matching"},
                "Explain INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN with reference to matched and unmatched rows.",
                "INNER JOIN returns records that have matching values in both tables. LEFT JOIN returns all records from the left table and matched records from the right (NULL if unmatched). RIGHT JOIN returns all from the right and matched from the left. FULL OUTER JOIN returns all records when there is a match in either table."
            );
        }

        if (qLower.contains("where") && qLower.contains("having")) {
            return new ConceptEvaluation(
                "WHERE vs HAVING Clause",
                new String[] {"aggregate", "group by", "filter", "rows", "groups"},
                "Explain that WHERE filters individual rows before grouping, while HAVING filters aggregated groups after GROUP BY.",
                "WHERE filters individual rows before any grouping or aggregations occur, and cannot be used with aggregate functions. HAVING filters aggregated groups after the GROUP BY clause has been applied (e.g., HAVING COUNT(*) > 5)."
            );
        }

        if (qLower.contains("primary key") || qLower.contains("foreign key")) {
            return new ConceptEvaluation(
                "Primary Key vs Foreign Key",
                new String[] {"unique", "not null", "referential integrity", "relationship", "table"},
                "Define primary key (unique, NOT NULL row identifier) and foreign key (references primary key in another table for referential integrity).",
                "A Primary Key uniquely identifies each record in a table and cannot contain NULL values. A Foreign Key is a column or set of columns in one table that references the Primary Key of another table, establishing a relationship and enforcing referential integrity."
            );
        }

        if (qLower.contains("truncate") || (qLower.contains("delete") && qLower.contains("drop"))) {
            return new ConceptEvaluation(
                "DELETE vs TRUNCATE vs DROP",
                new String[] {"rollback", "dml", "ddl", "where", "schema", "faster"},
                "DELETE is DML (row-by-row, logged, can use WHERE, rollable). TRUNCATE is DDL (deletes all rows quickly by deallocating pages). DROP is DDL (removes table structure and data entirely).",
                "DELETE is a DML command that removes rows conditionally using WHERE, logs each deletion, and can be rolled back. TRUNCATE is a DDL command that quickly removes all rows by deallocating data pages without logging individual row deletions. DROP is a DDL command that completely deletes both the table data and schema structure."
            );
        }

        if (qLower.contains("acid")) {
            return new ConceptEvaluation(
                "ACID Properties",
                new String[] {"atomicity", "consistency", "isolation", "durability", "transaction", "rollback"},
                "Define Atomicity (all-or-nothing), Consistency (preserves invariants), Isolation (transactions execute independently), and Durability (committed changes persist).",
                "ACID guarantees reliable database transactions: 1) Atomicity: all operations in a transaction succeed or all roll back; 2) Consistency: transaction brings database from one valid state to another; 3) Isolation: concurrent transactions execute without interfering; 4) Durability: committed changes survive system crashes."
            );
        }

        // ── Operating Systems ─────────────────────────────────────────────────
        if (qLower.contains("process") && qLower.contains("thread")) {
            return new ConceptEvaluation(
                "Process vs Thread",
                new String[] {"address space", "memory", "context switch", "lightweight", "shared"},
                "Explain that a process has independent memory and resources, whereas threads share the process's address space and heap, making context switching cheaper.",
                "A process is an isolated instance of an executing program with its own memory space, file handles, and PCB. A thread is a lightweight execution unit within a process; threads share the parent process's address space and heap but maintain their own registers and call stack."
            );
        }

        if (qLower.contains("deadlock")) {
            return new ConceptEvaluation(
                "Deadlock & 4 Necessary Conditions",
                new String[] {"mutual exclusion", "hold and wait", "no preemption", "circular wait"},
                "State the 4 Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
                "A deadlock occurs when processes are blocked because each holds a resource and waits for another resource held by another process. The four required conditions are: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, and 4) Circular Wait. Breaking any one condition prevents deadlocks."
            );
        }

        // ── Computer Networks ─────────────────────────────────────────────────
        if (qLower.contains("tcp") && qLower.contains("udp")) {
            return new ConceptEvaluation(
                "TCP vs UDP",
                new String[] {"connection", "handshake", "reliable", "unreliable", "speed", "overhead"},
                "Contrast TCP (connection-oriented, reliable, 3-way handshake, retransmission) with UDP (connectionless, fast, lightweight, best-effort).",
                "TCP is a connection-oriented, reliable protocol that guarantees in-order packet delivery using a 3-way handshake, sequence numbers, and acknowledgments. UDP is a connectionless, lightweight protocol that sends datagrams without establishing a handshake or verifying delivery, ideal for gaming and streaming."
            );
        }

        if (qLower.contains("osi")) {
            return new ConceptEvaluation(
                "OSI 7 Layers",
                new String[] {"physical", "data link", "network", "transport", "session", "presentation", "application"},
                "List the 7 layers from bottom to top: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
                "The 7 OSI layers from bottom to top are: 1. Physical (raw bit streams), 2. Data Link (frames, MAC addresses), 3. Network (packets, IP routing), 4. Transport (segments, TCP/UDP), 5. Session (connections), 6. Presentation (syntax, encryption), 7. Application (user protocols like HTTP, DNS)."
            );
        }

        // ── Data Structures & Algorithms ──────────────────────────────────────
        if (qLower.contains("stack") && qLower.contains("queue")) {
            return new ConceptEvaluation(
                "Stack vs Queue",
                new String[] {"lifo", "fifo", "push", "pop", "enqueue", "dequeue"},
                "Explain LIFO for stack (push/pop) and FIFO for queue (enqueue/dequeue) with real-world examples.",
                "A Stack is a LIFO (Last-In-First-Out) structure where elements are added and removed from the top (e.g., undo mechanism, call stack). A Queue is a FIFO (First-In-First-Out) structure where elements enter at the rear and exit from the front (e.g., printer spooling, task queues)."
            );
        }

        if (qLower.contains("binary search") || qLower.contains("big o")) {
            return new ConceptEvaluation(
                "Binary Search & Big O Complexity",
                new String[] {"o(log n)", "sorted", "divide and conquer", "half", "time complexity"},
                "State O(log n) time complexity, prerequisite of a sorted array, and halving the search space each step.",
                "Binary search finds an element in a sorted array by repeatedly dividing the search interval in half. Because the search space is halved at each step, its time complexity is O(log n), compared to O(n) for linear search."
            );
        }

        // ── System Design ─────────────────────────────────────────────────────
        if (qLower.contains("horizontal") && qLower.contains("vertical")) {
            return new ConceptEvaluation(
                "Horizontal vs Vertical Scaling",
                new String[] {"scale up", "scale out", "load balancer", "hardware", "servers", "nodes"},
                "Contrast scaling up (adding CPU/RAM to a single machine) with scaling out (adding more machines/nodes behind a load balancer).",
                "Vertical scaling (scale up) means adding more power (CPU, RAM, SSD) to an existing server; it is simple but has hardware limits and single points of failure. Horizontal scaling (scale out) means adding more server instances to distribute load via load balancers, providing elastic scalability and high availability."
            );
        }

        return null;
    }

    /** Helper — checks if text contains a substring (case-insensitive already handled by caller lowercasing) */
    private boolean contains(String text, String keyword) {
        return text.contains(keyword);
    }
}

