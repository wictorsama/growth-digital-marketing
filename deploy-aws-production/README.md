Instructions:

1. Replace <your-aws-account-id> , <your-ecs-cluster-name> , and <your-ecs-service-name> with your actual AWS values.
2. Save this script as deploy.ps1 in c:\Users\Wictorsama\source\desafio\deploy-aws-production .
3. Open PowerShell, navigate to the script directory, and run:
   ```powershell
   .\deploy.ps1
    ```
This script will build, push, and deploy your application to AWS ECS using ECR as the image registry.