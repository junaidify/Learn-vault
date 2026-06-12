package learn_vault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class LearnVaultApplication {

	public static void main(String[] args) {
		SpringApplication.run(LearnVaultApplication.class, args);
	}

}
