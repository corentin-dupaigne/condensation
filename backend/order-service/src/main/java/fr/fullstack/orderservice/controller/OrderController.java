package fr.fullstack.orderservice.controller;

import fr.fullstack.dto.OrderEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    public OrderController(KafkaTemplate<String, OrderEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @PostMapping
    public String createOrder(@RequestBody OrderEvent event) {
        kafkaTemplate.send("orders-topic", event.orderId(), event);
        return "Commande envoyée à Kafka !";
    }

}
