import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order } from '../../../../core/models';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-order-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-create.html',
  styleUrl: './order-create.scss',
})
export class OrderCreate {
  form!: FormGroup;

  ordersCount = 0;

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
  ) {
    this.ordersCount = this.orderService.getAll().length;

    this.form = this.fb.group({
      clientId: ['', Validators.required],
      prepDate: ['', Validators.required],
      deliveryDate: ['', Validators.required],
      deliveryDeadlineTime: ['', Validators.required],
      isUrgent: [false],
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const value = this.form.value;

    const newOrder = this.orderService.create({
      clientId: value.clientId,
      status: 'PENDING',
      prepDate: value.prepDate,
      deliveryDate: value.deliveryDate,
      deliveryDeadlineTime: value.deliveryDeadlineTime,
      isUrgent: value.isUrgent,
      createdByUserId: 'user_1',
      items: [],
    });

    this.ordersCount = this.orderService.getAll().length;

    this.form.reset({
      isUrgent: false,
    });

    console.log('Nova encomenda criada:', newOrder);
  }
}
