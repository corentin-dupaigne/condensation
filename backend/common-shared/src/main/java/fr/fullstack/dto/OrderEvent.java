package fr.fullstack.dto;

import java.io.Serializable;

public record OrderEvent(String orderId, String product, int quantity) implements Serializable {}
