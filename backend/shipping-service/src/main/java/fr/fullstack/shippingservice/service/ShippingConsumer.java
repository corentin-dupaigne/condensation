package fr.fullstack.shippingservice.service;

import fr.fullstack.dto.OrderEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class ShippingConsumer {

    @KafkaListener(topics = "orders-topic", groupId = "shipping-group")
    public void consume(OrderEvent event) {
        System.out.println("Colis prêt pour : " + event.product());
    }

}
