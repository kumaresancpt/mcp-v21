# Stack Profile: java-springboot

## Language
Java 17

## Framework
Spring Boot 3

## Package manager
Maven (pom.xml)

## Install command
mvn install -DskipTests

## Run command
mvn spring-boot:run

## Build command
mvn package -DskipTests

## Test command
mvn test

## Dev server port
8000

## Dev server URL
http://localhost:8000

## API docs URL
http://localhost:8000/swagger-ui.html

## Project file
pom.xml

## Project structure
backend/
  pom.xml
  src/
    main/
      java/com/app/
        Application.java      ← entry point (@SpringBootApplication)
        controller/           ← REST controllers
        service/              ← business logic interfaces + implementations
        model/                ← JPA entities
        dto/                  ← request/response DTOs
        repository/           ← JPA repositories
        config/               ← security, CORS, Swagger config
        exception/            ← global exception handler
      resources/
        application.properties        ← ALL config with placeholder values
        application-dev.properties    ← real local values (NOT committed)
    test/
      java/com/app/

## Controller pattern
- @RestController + @RequestMapping("/api/<resource>")
- Inject service via @Autowired or constructor injection
- Return ResponseEntity<T>
- Use PascalCase for class names, camelCase for methods

## Service pattern
- Interface in service/<Name>Service.java
- Implementation in service/<Name>ServiceImpl.java
- Annotate with @Service

## Model pattern
- JPA @Entity classes in model/
- Use @Id, @GeneratedValue, @Column annotations
- DTOs (no JPA annotations) in dto/

## Config pattern
- application.properties for ALL config with placeholder values
- application-dev.properties for real local values (NOT committed)
- Read via @Value("${key}") or @ConfigurationProperties
- NEVER hardcode secrets

## Auth pattern
Spring Security + JWT
- Dependency: spring-boot-starter-security
- Dependency: jjwt-api, jjwt-impl, jjwt-jackson
- JwtAuthenticationFilter extends OncePerRequestFilter
- Store in localStorage key: accessToken (frontend)

## Password hashing
BCryptPasswordEncoder — strength 12
NEVER store plain-text passwords
NEVER return passwordHash in any API response

## Swagger
springdoc-openapi-starter-webmvc-ui
ALWAYS enable in ALL environments — no profile guard

## Error response format
return ResponseEntity.badRequest().body(Map.of("detail", "error message"));
ALWAYS use "detail" as the error field name

## CORS pattern
@Configuration class with WebMvcConfigurer
Override addCorsMappings — allow frontend origin, credentials

## Core Maven dependencies
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- spring-boot-starter-validation
- postgresql (runtime)
- jjwt-api, jjwt-impl, jjwt-jackson
- springdoc-openapi-starter-webmvc-ui
- lombok

## Naming conventions
- Classes: PascalCase
- Methods and variables: camelCase
- Files: PascalCase.java
- JSON response fields: camelCase (Jackson default)
- Database columns: snake_case
