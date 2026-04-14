package fr.fullstack.backend.logger;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
public class KafkaLoggingAspect {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public KafkaLoggingAspect(KafkaTemplate<String, Object> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @AfterReturning(
            pointcut = "execution(public * fr.fullstack.backend.service.*.*(..))",
            returning = "result"
    )
    public void logEveryServiceAction(JoinPoint joinPoint, Object result) {

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();

        String className = signature.getDeclaringType().getSimpleName();
        String methodName = signature.getMethod().getName();

        Map<String, Object> logMessage = new HashMap<>();
        logMessage.put("timestamp", OffsetDateTime.now().toString());

        logMessage.put("action", className + "." + methodName);

        Object[] args = joinPoint.getArgs();
        String[] paramNames = signature.getParameterNames();
        Map<String, Object> methodParams = new HashMap<>();

        if (args != null && paramNames != null) {
            for (int i = 0; i < args.length; i++) {
                if (args[i] != null && !args[i].getClass().getName().startsWith("org.springframework")) {
                    methodParams.put(paramNames[i], args[i]);
                }
            }
        }
        logMessage.put("parameters", methodParams);

        if (result != null) {
            logMessage.put("hasResult", true);
            logMessage.put("resultType", result.getClass().getSimpleName());
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

            String jsonPayload = mapper.writeValueAsString(logMessage);

            kafkaTemplate.send("catalog-logs", jsonPayload);

        } catch (Exception e) {
            System.err.println("Erreur de conversion JSON : " + e.getMessage());
        }
    }
}