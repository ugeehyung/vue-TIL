<template>
  <base-section class="cart-wrap pa-0">
    <v-card
      v-if="hasCartItems || isCreatingOrder"
      elevation="0"
      class="mt-0 px-md-0 mx-auto rounded-0"
    >
      <!-- 장바구니 상단 문구 -->
      <v-card-subtitle v-show="canRelease" class="pt-8 text-md-left text-center cart-gift-notice">
        <p class="ma-0 word-keep grey--text text--darken-4">
          시크리티브 크리스틴 먼슬리 올리브 제품을 구매하면 하파 렌즈 케이스를 드려요💙
        </p>
      </v-card-subtitle>
      <v-card-text class="cart-items-wrap">
        <v-checkbox
          v-model="selectAll"
          @change="toggleSelectAllCartItems"
          :label="allCheckBoxLabel"
          color="#333333"
          class="all-checkbox"
        ></v-checkbox>
        <v-list-item
          v-for="(cartItem, cartItemId) in cart.items"
          :key="`cart-item-${cart.cart_token}-${cartItemId}`"
          class="cart-item"
        >
          <v-list-item-content class="py-0">
            <v-row class="pb-1 ma-0 item-actions-row">
              <v-col class="pa-0 col-6 item-checkbox">
                <strong
                  v-if="cartItem.disabled_reason === 'quantity'"
                  class="word-keep disabled-reason"
                  >재고 부족</strong
                >
                <strong
                  v-else-if="cartItem.disabled_reason === 'price'"
                  class="word-keep disabled-reason"
                  >가격 변경</strong
                >
                <v-checkbox
                  v-else-if="!cartItem.disabled"
                  v-model="selectedCartItemIds"
                  :value="cartItemId"
                  hide-details
                  multiple
                  color="#333333"
                  class="ma-0 pa-0"
                  @change="selectAll = false"
                ></v-checkbox>
              </v-col>
              <v-col class="pa-0 col-6">
                <div class="btn-item-delete">
                  <v-btn
                    class="pa-0"
                    small
                    text
                    @click="deleteCartProducts([cartItemId])"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
              </v-col>
            </v-row>
            <v-row class="px-1 py-0 ma-0 item-info-row justify-space-between">
              <v-col class="pa-0 item-thumb">
                <router-link
                  :to="{
                    name: 'CustomerProduct',
                    params: {
                      handle: getCartProduct(cartItem.ppb_product_id).handle,
                    },
                  }"
                >
                  <v-img
                    :src="getCartProduct(cartItem.ppb_product_id).image.src"
                    :alt="getCartProduct(cartItem.ppb_product_id).title"
                    :class="{ disabled: cartItem.disabled }"
                    max-width="150"
                  ></v-img>
                </router-link>
              </v-col>
              <v-col class="pa-0 pl-4 item-description">
                <p class="item-title word-keep">
                  <router-link
                    :to="{
                      name: 'CustomerProduct',
                      params: {
                        handle: getCartProduct(cartItem.ppb_product_id).handle,
                      },
                    }"
                    class="black--text"
                    style="text-decoration: none;"
                  >
                    {{ getCartProduct(cartItem.ppb_product_id).title }}
                  </router-link>
                </p>
                <div
                  v-if="!cartItem.disabled"
                  class="item-price d-inline-block"
                >
                  <span
                    v-if="isDiscount(getCartProduct(cartItem.ppb_product_id))"
                    :class="{
                      'compare-at-price': isDiscount(
                        getCartProduct(cartItem.ppb_product_id)
                      ),
                    }"
                  >
                    {{
                      formatPrice(
                        getCompareAtPriceForCart(cartItem) * cartItem.count,
                        'KRW'
                      )
                    }}원
                  </span>
                  <span
                    :class="{
                      'discount-price': isDiscount(
                        getCartProduct(cartItem.ppb_product_id)
                      ),
                    }"
                  >
                    {{
                      formatPrice(
                        cartItem.cart_item_price * cartItem.count,
                        'KRW'
                      )
                    }}원
                  </span>
                </div>
                <div class="d-flex ma-0">
                  <div class="pa-0 d-flex item-count">
                    <div class="item-count-inner d-flex">
                      <v-btn
                        :disabled="cartItem.count < 2 || cartItem.disabled"
                        @click="
                          cartItem.count--;
                          updateCartProduct(
                            cartItem.ppb_product_id,
                            cartItem.variant_id,
                            cartItem.count,
                            cartItemId
                          );
                        "
                      >
                        <v-icon small>mdi-minus</v-icon>
                      </v-btn>
                      <v-text-field
                        v-model="cartItem.count"
                        type="number"
                        class="qty ma-0 pa-0 text-center"
                        :disabled="cartItem.disabled"
                        min="1"
                        @change="
                          updateCartProduct(
                            cartItem.ppb_product_id,
                            cartItem.variant_id,
                            cartItem.count,
                            cartItemId
                          )
                        "
                      ></v-text-field>
                      <v-btn
                        :disabled="998 < cartItem.count || cartItem.disabled"
                        @click="
                          cartItem.count++;
                          updateCartProduct(
                            cartItem.ppb_product_id,
                            cartItem.variant_id,
                            cartItem.count,
                            cartItemId
                          );
                        "
                      >
                        <v-icon small>mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <div class="pl-4 item-power">
                    <v-icon class="arrow">mdi-chevron-down</v-icon>
                    <select
                      v-model="cartItem.variant_id"
                      :disabled="cartItem.disabled"
                      class="item-power-select"
                      @change="
                        checkHasSameOption(cartItem.variant_id);
                        updateCartProduct(
                          cartItem.ppb_product_id,
                          cartItem.variant_id,
                          cartItem.count,
                          cartItemId
                        );
                      "
                    >
                      <option disabled selected value="0">옵션 선택</option>
                      <option
                        v-for="(v, index) in getCartProduct(
                          cartItem.ppb_product_id
                        ).variants || []"
                        :key="`${v}-${index}`"
                        :disabled="checkProductVariantAvailability(v)"
                        :value="`${v.id}`"
                      >
                        {{ v.option2 }}
                        <!-- TODO 추후 ETC 상품 대응 -->
                        {{ checkProductVariantAvailability(v) ? '[품절]' : '' }}
                      </option>
                    </select>
                  </div>
                  <v-progress-circular
                    v-if="
                      !isMobileSize &&
                        showProgress &&
                        updateVariantId === cartItem.variant_id
                    "
                    :width="3"
                    size="30"
                    indeterminate
                    color="#000"
                    class="ml-2"
                    style="transform: scale(0.7);"
                  />
                </div>
                <div
                  v-if="!cartItem.disabled"
                  class="mt-3 item-coupon"
                  :class="{
                    'has-coupon': hasProductCoupon,
                    'has-selected-coupon': cartItem.ppb_coupon_id,
                  }"
                >
                  <div
                    class="d-inline-flex align-center"
                    @click.stop="
                      openSelectProductCouponDialog(cartItemId, cartItem)
                    "
                  >
                    <div v-html="getProductCouponButtonText(cartItem)"></div>
                    <v-icon class="ml-auto d-block">mdi-chevron-down</v-icon>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>

        <!-- 사은품 내용 -->
        <v-list-item v-show="freeGiftEnable && canRelease" class="pa-0 ma-0 cart-gift">
          <v-row class="align-center">
            <v-col class="pl-4 py-5 gift-image-wrap">
              <v-img :src="cartGiftImage" alt="사은품" max-width="150"></v-img>
            </v-col>
            <v-col class="gift-text-wrap">
              <p class="mb-3 subtitle-1 font-weight-bold">
                Hapa Lens Case
              </p>
              <p>0원</p>
              <p class="subtitle-1">
                소중한 하파크리스틴 렌즈를 여기에 보관하세요 🤍
              </p>
              <div class="pa-0 d-flex item-count">
                <p>수량:</p>
                <div class="item-count-inner d-flex">
                  <v-btn disabled>
                    <v-icon small>mdi-minus</v-icon>
                  </v-btn>
                  <v-text-field
                    disabled
                    type="number"
                    class="qty ma-0 pa-0 text-center free-gift "
                    :value="freeGiftCount"
                    color="#000"
                  ></v-text-field>
                  <v-btn disabled>
                    <v-icon small>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-list-item>
        <!-- 사은품 내용 끝 -->

        <section class="order-coupon-section py-2">
          <v-row class="ma-0 flex-column">
            <div class="d-flex justify-space-between align-center order-coupon">
              <span class="subtitle-1 black--text">장바구니 할인</span>
              <div
                class="d-inline-flex align-center"
                :class="{
                  'has-coupon': hasOrderCoupon && availableOrderCoupons.length,
                  'has-selected-coupon': cart.ppb_coupon_id,
                }"
                @click.stop="openSelectOrderCouponDialog"
              >
                <div v-html="orderCouponButtonText"></div>
                <v-icon class="ml-auto d-block">mdi-chevron-down</v-icon>
              </div>
            </div>
          </v-row>
        </section>
        <v-divider></v-divider>
        <section>
          <v-row class="d-block cart-price-wrap">
            <p
              class="d-flex justify-space-between align-baseline cart-total-price mt-0 mb-2"
            >
              결제금액
              <span>{{ formatPrice(paymentAmount) }}원</span>
            </p>
            <p>
              총 상품금액
              <span>{{ formatPrice(productsPrice) }}원</span>
            </p>
            <p>
              상품할인
              <span :class="{ discount: productsDiscountPrice }">
                <template v-if="productsDiscountPrice">-</template>
                {{ formatPrice(productsDiscountPrice) }}원</span
              >
            </p>
            <p>
              쿠폰할인
              <span
                :class="{
                  discount:
                    productCouponDiscountPrice || orderCouponDiscountPrice,
                }"
              >
                <template
                  v-if="productCouponDiscountPrice || orderCouponDiscountPrice"
                  >-</template
                >
                {{
                  formatPrice(
                    productCouponDiscountPrice + orderCouponDiscountPrice
                  )
                }}원</span
              >
            </p>
            <p>
              배송비
              <span>무료배송</span>
            </p>
          </v-row>
        </section>
      </v-card-text>
      <v-card-text class="cart-box-wrap pb-6">
        <p class="cart-box-title">예약자 정보</p>
        <div v-if="!isCustomerSignedIn" class="login-request-wrap">
          <p>예약자 정보를 기입하기 위해 로그인을 해주세요.</p>
          <kakao-login></kakao-login>
        </div>
        <div class="customer-info-wrap">
          <div v-if="!isCustomerSignedIn" class="cart-box-title">
            비회원 주문
          </div>
          <v-row class="customer-input">
            <label for="customerName">이름</label>
            <input
              id="customerName"
              v-model="customerName"
              autocomplete="off"
              placeholder="이름을 입력해주세요."
              type="text"
            />
          </v-row>
          <v-row class="customer-input">
            <label for="customerPhone">연락처</label>
            <input
              id="customerPhone"
              :value="customerPhone"
              class="customer-phone"
              autocomplete="off"
              placeholder="연락처를 입력해주세요."
              type="tel"
              @input="changePhoneNumber"
              maxlength="13"
            />
            <v-btn
              class="btn-check-number"
              :class="{ active: validationNumber && !isValidated }"
              text
              @click="sentValidationCode"
              >번호인증
            </v-btn>
          </v-row>
          <v-row class="cart-box-save-phone" v-if="isCustomerSignedIn">
            <v-checkbox
              v-model="savePhone"
              color="#333333"
              label="연락처 저장 (연락처를 다음에도 사용)"
            ></v-checkbox>
          </v-row>
          <v-row v-show="hasValidationCode" class="customer-input">
            <v-col cols="12" class="pa-0">
              <label>인증번호</label>
              <div class="validation-code-input-wrap">
                <input
                  v-model="validationCode"
                  id="validationCode"
                  class="validation-code"
                  autocomplete="off"
                  placeholder="인증번호 입력"
                  type="number"
                  @input="checkValidationCode"
                />
                <span class="countdown"
                  >{{ countDownMinutes }} : {{ countDownSeconds }}
                </span>
              </div>
            </v-col>
            <v-col cols="12" class="pa-0">
              <div class="validation-code-info">
                <p v-if="isValidationFailed" class="validation-fail">
                  <v-icon>mdi-alert-circle-outline</v-icon>
                  번호 인증에 실패했습니다.
                  <span class="sub-txt">인증번호를 다시 확인해주세요.</span>
                </p>
                <p v-if="finishCountDown">
                  인증시간이 만료되었습니다. 번호인증을 다시 진행해주세요.
                </p>
              </div>
            </v-col>
          </v-row>
          <v-row
            v-show="showFailedSentValidation"
            class="validation-code-failed"
          >
            <p class="validation-code-info">* 번호를 다시 확인해주세요.</p>
          </v-row>
          <v-row v-show="isValidated" class="validation-success">
            <p class="validation-code-info">
              <v-icon>mdi-check</v-icon>
              번호 인증이 완료되었습니다.
            </p>
          </v-row>
          <div v-if="!isCustomerSignedIn" class="cart-box-term">
            <p class="cart-box-title">약관 동의</p>
            <div>
              <v-checkbox
                class="term-check-box font-weight-bold"
                v-model="acceptAllTerms"
                label="전체동의"
              ></v-checkbox>
            </div>
            <div>
              <p class="term-title">◦ 이용약관 동의</p>
              <customer-terms-of-service></customer-terms-of-service>
              <v-checkbox
                class="term-check-box"
                v-model="acceptTerm"
                label="이용약관에 동의합니다.(필수)"
              ></v-checkbox>
            </div>
            <div>
              <p class="term-title">◦ 개인정보 수집·이용 동의</p>
              <customer-privacy-policy></customer-privacy-policy>
              <v-checkbox
                class="term-check-box"
                v-model="acceptPrivacyTerm"
                label="개인정보 수집·이용에 동의합니다.(필수)"
              ></v-checkbox>
            </div>
            <div class="term-wrap pa-0">
              <v-checkbox
                class="term-check-box"
                v-model="acceptTermAgeOver14"
                label="만 14세 이상입니다.(필수)"
              ></v-checkbox>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-text class="cart-box-wrap cart-pickup-store">
        <p class="cart-box-title">나의 현재 픽업 매장</p>
        <div v-if="hasPickUpFranchise && !pickUpFranchise.is_unable">
          <div class="store-info">
            <div>
              <p class="store-name">
                <v-icon small color="#ff7092">mdi-map-marker</v-icon>
                {{ pickUpFranchise.store_name }}
              </p>
            </div>
            <p class="store-address">{{ pickUpFranchise.full_address }}</p>
            <a class="store-phone" v-bind:href="`tel:${pickUpFranchise.phone1}`"
              >{{ pickUpFranchise.phone1 }}
            </a>
            <v-btn
              class="btn-change-store"
              @click.stop="showChangeStore = true"
              :ripple="false"
              >변경
            </v-btn>
          </div>
          <div class="store-map" v-if="showFranchiseMap">
            <v-btn
              class="btn-save-favorite-franchise"
              text
              small
              :class="{ active: isFavorite }"
              @click="toggleFavorite(isFavorite, pickUpFranchise.id)"
            >
              <v-icon
                >{{ isFavorite ? 'mdi-heart' : 'mdi-heart-plus-outline' }}
              </v-icon>
              {{ isFavorite ? '관심매장' : '관심매장등록' }}
            </v-btn>
            <kakao-map
              :lat="Number(pickUpFranchise.lat)"
              :lng="Number(pickUpFranchise.lng)"
              :prop-franchise-id="Number(pickUpFranchise.id)"
              :height="mapHeight"
              :map-type="'storeDetail'"
              :draggable="false"
              :zoomable="false"
            ></kakao-map>
            <div class="map-cover"></div>
          </div>
        </div>
        <div v-else class="franchise-select-wrap">
          <p>
            <v-icon class="mr-1" color="red">mdi-alert-box-outline</v-icon>
            <span v-html="noPickUpFranchiseMessage"></span>
          </p>
          <v-btn text @click.stop="showChangeStore = true"
            >픽업 매장 선택하기</v-btn
          >
        </div>
      </v-card-text>
      <v-card-actions
        class="cart-action pt-4"
        :class="{ active: checkoutCondition }"
      >
        <v-btn
          class="btn-checkout"
          @click.stop="showOrderConfirmDialog = true"
          :disabled="!checkoutCondition"
        >
          픽업 예약하기
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card
      v-else
      elevation="0"
      class="cart-empty mx-auto rounded-0 mt-md-10 mt-15"
    >
      <p>카트가 비어있습니다.</p>
      <router-link to="/collections/best">
        하파크리스틴의 베스트 상품을 확인해보세요.
      </router-link>
    </v-card>
    <v-dialog
      v-model="showSelectProductCouponDialog"
      key="productCouponDialog"
      max-width="400"
      :fullscreen="isMobileSize"
      :transition="couponDialogTransition"
      scrollable
    >
      <select-product-coupons-dialog
        v-if="showSelectProductCouponDialog"
        :cart-item="cartItem"
        @close-dialog="closeSelectCouponDialog"
      ></select-product-coupons-dialog>
    </v-dialog>
    <v-dialog
      v-model="showSelectOrderCouponDialog"
      key="orderCouponDialog"
      max-width="400"
      :fullscreen="isMobileSize"
      :transition="couponDialogTransition"
      scrollable
    >
      <select-order-coupons-dialog
        v-if="showSelectOrderCouponDialog"
        :sum-of-selected-products-price.sync="sumOfSelectedProductsPrice"
        @close-dialog="showSelectOrderCouponDialog = false"
      ></select-order-coupons-dialog>
    </v-dialog>
    <v-dialog
      v-model="showChangeStore"
      key="changeStoreDialog"
      fullscreen
      transition="dialog-bottom-transition"
      hide-overlay
      scrollable
    >
      <template v-if="showChangeStore">
        <v-container class="store-change-modal-wrap">
          <v-card>
            <v-card-title class="d-block text-center change-modal-title">
              <v-btn
                class="mx-0 px-0 btn-close"
                min-width="auto"
                small
                text
                @click="showChangeStore = false"
                :ripple="false"
                >닫기
              </v-btn>
              <p>매장 선택</p>
            </v-card-title>
            <v-card-text class="pa-0">
              <customer-stores class="store-change-modal"></customer-stores>
            </v-card-text>
          </v-card>
        </v-container>
      </template>
    </v-dialog>
    <v-dialog v-model="showCartChangedModal" max-width="350">
      <customer-info-modal>
        <template #title>
          카트 변경 알림
        </template>
        <template #contents>
          <p class="d-block">카트 변경 상품 {{ disabledCartItems.length }}개</p>
          <span
            v-for="(item, index) in disabledCartItems"
            :key="`disabled-cart-item-${item.title}-${index}`"
            class="d-block"
          >
            {{ item.title }} / {{ item.variant }}
          </span>
        </template>
        <template #buttons>
          <v-btn text @click="showCartChangedModal = false">확인</v-btn>
        </template>
      </customer-info-modal>
    </v-dialog>
    <v-dialog
      v-model="showOrderConfirmDialog"
      max-width="350"
      :persistent="isCreatingOrder"
    >
      <customer-info-modal class="cart-confirm-dialog">
        <template #title>
          픽업 예약 완료
        </template>
        <template #contents>
          <div v-if="isCreatingOrder" class="my-3 text-center">
            픽업 예약이 진행 중입니다.
            <v-progress-linear
              class="mt-3 mx-auto"
              indeterminate
              rounded
              height="5"
              color="#ff7092"
              style="max-width: 60%"
            ></v-progress-linear>
          </div>
          <div v-else>
            픽업 예약을 완료하시겠습니까?
            <p class="mt-1 mb-0">
              <span class="title">예약상품</span>
              <span class="d-inline-flex cart-product">
                <span class="cart-product-title">{{
                  firstSelectedProduct.title
                }}</span>
                <span
                  class="cart-product-count"
                  v-if="1 < selectedCartItemIds.length"
                >
                  외 {{ selectedCartItemIds.length - 1 }}건</span
                >
              </span>
            </p>
            <p class="mb-0">
              <span class="title">예약자명</span>{{ customerName }}
            </p>
            <p class="mb-0">
              <span class="title">픽업매장</span
              >{{ pickUpFranchise.store_name }}
            </p>
          </div>
        </template>
        <template v-if="!isCreatingOrder" #buttons>
          <v-btn text @click="showOrderConfirmDialog = false" class="two-button"
            >취소
          </v-btn>
          <v-btn text @click.once="createOrder" class="two-button">
            확인
          </v-btn>
        </template>
      </customer-info-modal>
    </v-dialog>
  </base-section>
</template>

<script>
import ApplicationHelper from '@/mixins/ApplicationHelper';
import CustomerHelper from '@/mixins/CustomerHelper';
import BaseSection from '@/components/Section';
import { call, get } from 'vuex-pathify';
import _ from 'lodash';
import moment from 'moment';
import KakaoMap from '@/components/ppb/KakaoMap';
import KakaoLogin from '@/components/ppb/KakaoLogin';
import CustomerInfoModal from '@/components/customer/CustomerInfoModal';
import CustomerTermsOfService from '@/components/customer/CustomerTermsOfService';
import CustomerPrivacyPolicy from '@/components/customer/CustomerPrivacyPolicy';
import SelectOrderCouponsDialog from './components/SelectOrderCouponDialog';
import SelectProductCouponsDialog from './components/SelectProductCouponsDialog';
import CustomerStores from '../../../components/customer/CustomerStores';

export default {
  name: 'CustomerCart',
  components: {
    CustomerStores,
    SelectProductCouponsDialog,
    SelectOrderCouponsDialog,
    CustomerPrivacyPolicy,
    CustomerTermsOfService,
    CustomerInfoModal,
    BaseSection,
    KakaoMap,
    KakaoLogin,
  },
  props: {},
  data: () => {
    return {
      selectAll: true,
      isCreatingOrder: false,
      selectedCartItemIds: [],
      mapHeight: 230,
      showFranchiseMap: false,
      isCustomerSignedIn: false,
      showChangeStore: false,
      hasValidationCode: false,
      validationCode: null,
      customerName: '',
      customerPhone: '',
      validationNumber: false,
      showFailedSentValidation: false,
      validationId: '',
      isValidated: false,
      isValidationFailed: false,
      acceptTerm: true,
      acceptPrivacyTerm: true,
      acceptTermAgeOver14: true,
      countDown: 600,
      timer: null,
      finishCountDown: false,
      showProgress: false,
      updateVariantId: null,
      savePhone: true,
      showCartChangedModal: false,
      showSelectProductCouponDialog: false,
      showSelectOrderCouponDialog: false,
      cartItem: {},
      showOrderConfirmDialog: false,
      freeGiftCountDefault: 1,
    };
  },
  computed: {
    ...get('hapakr', [
      'isProductLoaded',
      'cartToken',
      'productsById',
      'cart',
      'myCoupons',
      'myProductCoupons',
      'myOrderCoupons',
    ]),
    ...get('hapakr', ['isProductLoaded', 'cartToken', 'productsById', 'cart']),
    // 사은품 노출되는 기간
    isEventStart() {
      return moment().isAfter('2022-07-21T11:00:00+0900');
    },
    isEventEnd() {
      return moment().isBefore('2022-08-04T10:00:00+0900');
    },
    canRelease() {
      return this.isEventStart && this.isEventEnd;
    },
    // 사은품 노출되는 기간 끝
    pickUpFranchise() {
      return (
        this.exposedFranchises.filter(
          f => f.id === this.cart.ppb_franchise_id
        )[0] || {}
      );
    },
    noPickUpFranchiseMessage() {
      if (this.cart && !this.cart.ppb_franchise_id) {
        return '선택된 픽업 매장이 없습니다.';
      } else if (this.hasPickUpFranchise && this.pickUpFranchise.is_unable) {
        return `기존에 선택하신 <strong>${
          this.franchisesById[this.cart.ppb_franchise_id]?.store_name
        }은 택배 파업으로 인해 일시적으로 픽업서비스 이용이 불가합니다.</strong>`;
      } else if (!this.hasPickUpFranchise) {
        return `기존에 선택하신 <strong>${
          this.franchisesById[this.cart.ppb_franchise_id]?.store_name
        }은 더이상 픽업 서비스를 제공하지 않습니다.</strong>`;
      }
      return '';
    },
    paymentAmount() {
      return (
        this.productsPrice -
        (this.productsDiscountPrice +
          this.productCouponDiscountPrice +
          this.orderCouponDiscountPrice)
      );
    },
    productsPrice() {
      const { selectedCartItemIds } = this;
      const cartItems = this.cart.items;
      let total = 0;

      _.each(selectedCartItemIds, id => {
        const cartItem = cartItems[id];
        if (this.getCompareAtPriceForCart(cartItem)) {
          total += this.getCompareAtPriceForCart(cartItem) * cartItem.count;
        } else {
          const cartItemProduct = this.getCartProduct(cartItem?.ppb_product_id);
          if (cartItemProduct?.variants) {
            total += (cartItemProduct.variants[0]?.price || 0) * cartItem.count;
          }
        }
      });

      return total;
    },
    productsDiscountPrice() {
      const { selectedCartItemIds } = this;
      const cartItems = this.cart.items;
      let total = 0;

      _.each(selectedCartItemIds, id => {
        const cartItem = cartItems[id];
        const cartItemProduct = this.getCartProduct(cartItem?.ppb_product_id);
        const comparePrice = this.getCompareAtPriceForCart(cartItem);
        if (comparePrice && cartItemProduct?.variants) {
          const discountPrice =
            comparePrice - (cartItemProduct.variants[0]?.price || 0);
          total += discountPrice * cartItem.count;
        }
      });

      return total;
    },
    productCouponDiscountPrice() {
      const { selectedCartItemIds } = this;
      const cartItems = this.cart.items;
      let total = 0;

      _.each(selectedCartItemIds, id => {
        const cartItem = cartItems[id];
        if (cartItem?.discount_price) {
          total += cartItem?.discount_price;
        }
      });

      return total;
    },
    orderCouponDiscountPrice() {
      return this.cart.order_discount_price || 0;
    },
    // 쿠폰 최소주문금액 적용 가능 여부 체크용
    sumOfSelectedProductsPrice() {
      return (
        this.productsPrice -
        (this.productsDiscountPrice + this.productCouponDiscountPrice)
      );
    },
    hasCartItems() {
      return this.cart.item_count > 0;
    },
    hasProductCoupon() {
      return 0 < this.myProductCoupons?.length;
    },
    hasOrderCoupon() {
      return 0 < this.myOrderCoupons?.length;
    },
    availableOrderCoupons() {
      return _.filter(
        this.myOrderCoupons,
        coupon => coupon.min_price <= this.sumOfSelectedProductsPrice
      );
    },
    orderCouponButtonText() {
      const { cart } = this;
      if (!this.isSignedIn) {
        return `<span class="pl-1">[쿠폰] 로그인 후 이용 가능</span>`;
      } else if (!this.hasOrderCoupon || !this.availableOrderCoupons.length) {
        return `<span class="pl-1">사용가능한 쿠폰이 없습니다.</span>`;
      } else if (!cart.ppb_coupon_id) {
        return `<span class="pl-1">적용하실 쿠폰을 선택하세요.</span>`;
      } else if (cart.ppb_coupon_id) {
        const couponText = this.getSelectedCouponText(cart.ppb_coupon_id);
        return `<span v-else class="pl-2 word-keep">${couponText}</span>`;
      }
      return '';
    },
    couponDialogTransition() {
      return this.isMobileSize ? 'dialog-bottom-transition' : '';
    },
    hasPickUpFranchise() {
      return 0 < Object.keys(this.pickUpFranchise).length;
    },
    countDownMinutes() {
      return Math.floor(this.countDown / 60);
    },
    countDownSeconds() {
      const seconds = this.countDown % 60;
      return 10 > seconds ? '0' + seconds : seconds;
    },
    checkoutCondition() {
      if (this.isCustomerSignedIn) {
        return (
          this.hasPickUpFranchise &&
          !this.pickUpFranchise.is_unable &&
          this.selectedCartItemIds.length > 0 &&
          this.isValidated
        );
      } else {
        return (
          this.hasPickUpFranchise &&
          !this.pickUpFranchise.is_unable &&
          this.selectedCartItemIds.length > 0 &&
          this.isValidated &&
          this.acceptAllTerms
        );
      }
    },
    isFavorite() {
      return (
        this.isSignedIn &&
        (this.currentUser.favorite_franchise_ids || []).indexOf(
          this.pickUpFranchise.id
        ) >= 0
      );
    },
    disabledCartItems() {
      const result = [];
      _.each(this.cart.items, cartItem => {
        if (cartItem.disabled) {
          const disabledItem =
            this.getCartProduct(cartItem?.ppb_product_id) || {};
          const variant =
            _.keyBy(disabledItem.variants, 'id')[cartItem.variant_id] || {};
          result.push({
            title: disabledItem.title,
            disabled_reason: cartItem.disabled_reason,
            variant: variant.option2,
          });
        }
      });
      return result;
    },
    allCheckBoxLabel() {
      const cartTotal = _.size(this.cart.items);
      const selectedItemsTotal = this.selectedCartItemIds.length;
      return `전체선택(${selectedItemsTotal}/${cartTotal})`;
    },
    freeGiftCount() {
      let count = 0;
      if (!this.isProductLoaded) {
        return false;
      }
      if (!_.isEmpty(this.selectedCartItemIds)) {
        _.each(this.selectedCartItemIds, id => {
          const selectedCartItem = this.cart.items[id];
          const selectedItem = this.getCartProduct(
            selectedCartItem.ppb_product_id
          );
          const selectedItemTitle = selectedItem.title;
          const selectedItemProductType = selectedItem.product_type;
          if (
            !selectedCartItem?.disabled &&
            !selectedItemProductType.includes('1 day') &&
            selectedItemTitle.includes('시크리티브') &&
            selectedItemTitle.includes('올리브')
          ) {
            count += selectedCartItem?.count;
          }
        });
      }
      return `${count}`;
    },
    freeGiftEnable() {
      return 1 <= this.freeGiftCount;
    },
    cartGiftImage() {
      return 'https://cdn.winc.app/uploads/ppb/file/file/375/%EC%A0%9C%EB%AA%A9_%EC%97%86%EC%9D%8C-1.jpg';
    },
    firstSelectedProduct() {
      const cartItems = this.cart.items;
      const firstCartItem = cartItems[this.selectedCartItemIds[0]];
      return this.getCartProduct(firstCartItem?.ppb_product_id);
    },
    acceptAllTerms: {
      get() {
        return (
          this.acceptTerm && this.acceptPrivacyTerm && this.acceptTermAgeOver14
        );
      },
      set(val) {
        this.acceptTerm = val;
        this.acceptPrivacyTerm = val;
        this.acceptTermAgeOver14 = val;
      },
    },
  },
  created() {
    this.init();
    this.$nextTick(() => {
      if (this.hasPickUpFranchise) {
        this.showFranchiseMap = true;
      }
    });
  },
  methods: {
    ...call('hapakr', [
      'getCartTotalPrice',
      'getMyCoupons',
      'initCart',
      'putPpbHapakrCartCreatePpbOrder',
      'putPpbHapakrFranchisePublicAddFavorite',
      'getPpbHapakrProducts',
      'deletePpbHapakrCartCoupon',
      'putPpbHapakrCartItems',
      'deletePpbHapakrCartItems',
    ]),
    ...call('app', ['postPpbValidations', 'putPpbValidations']),
    init() {
      this.refreshCart();
      this.checkCartChanged();
      this.toggleSelectAllCartItems();
      if (this.isSignedIn) {
        this.getCoupons();
        this.isCustomerSignedIn = true;
        this.customerName = this.currentUser.name || '';
        if (this.currentUser.is_phone_validated) {
          this.customerPhone = this.currentUser.phone || '';
          this.isValidated = true;
        }
      }
    },
    async refreshCart() {
      if (this.isProductLoaded) {
        await this.initCart();
      } else {
        await this.initCart();
        await this.getPpbHapakrProducts({ queryString: '' });
      }
    },
    getCoupons() {
      this.getMyCoupons().catch(err => {
        console.error(`Coupon Error: ${err}`);
      });
    },
    getProductCouponButtonText(cartItem) {
      if (!this.isSignedIn) {
        return `<span class="pl-1">[쿠폰] 로그인 후 이용 가능</span>`;
      } else if (!this.hasProductCoupon) {
        return `<span class="pl-1">사용가능한 쿠폰이 없습니다.</span>`;
      } else if (!cartItem.ppb_coupon_id) {
        return `<span class="pl-1">적용하실 쿠폰을 선택하세요.</span>`;
      } else if (cartItem.ppb_coupon_id) {
        const couponText = this.getSelectedCouponText(cartItem.ppb_coupon_id);
        return `<span v-else class="pl-2 word-keep">${couponText}</span>`;
      }
    },
    getSelectedCouponText(couponId) {
      const myCoupons = _.keyBy(this.myCoupons, 'id');
      if (!myCoupons[couponId]) {
        return '';
      }
      const title = myCoupons[couponId].title || '';
      const discountValue =
        this.formatPrice(parseInt(myCoupons[couponId].discount_value)) || 0;
      return `${title} (${discountValue}원 할인)`;
    },
    openSelectProductCouponDialog(cartItemId, cartItem) {
      if (!this.isCustomerSignedIn || !this.hasProductCoupon) {
        return;
      }
      this.cartItem = cartItem;
      this.cartItem.id = cartItemId;
      this.showSelectProductCouponDialog = true;
    },
    openSelectOrderCouponDialog() {
      if (
        !this.isCustomerSignedIn ||
        !this.hasOrderCoupon ||
        !this.availableOrderCoupons.length
      ) {
        return;
      }
      this.showSelectOrderCouponDialog = true;
    },
    closeSelectCouponDialog() {
      this.showSelectProductCouponDialog = false;
      this.cartItem = {};
    },
    getCartProduct(ppbProductId) {
      return this.productsById[ppbProductId] || { image: {} };
    },
    updateCartProduct(ppbProductId, variantId, count, cartItemId) {
      this.showProgress = true;
      this.updateVariantId = variantId;

      this.putPpbHapakrCartItems({
        ppbProductId,
        variantId,
        count,
        cartItemId,
      })
        .then(() => {
          setTimeout(() => {
            this.showProgress = false;
          }, 1000);
        })
        .catch(err => {
          console.error(err);
          this.setCustomerSnackbar(`상품이 수정되지 않았습니다.`);
        });
    },
    checkHasSameOption(variantId) {
      const sameOptionItems = [];
      _.each(this.cart.items, item => {
        if (Number(variantId) === Number(item.variant_id)) {
          sameOptionItems.push(item);
        }
      });
      if (sameOptionItems.length > 1) {
        this.setCustomerSnackbar(
          '같은 상품의 동일한 도수의 상품이 존재합니다. 상품을 확인해주세요.'
        );
      }
    },
    checkProductVariantAvailability(variant) {
      return variant.inventory_quantity <= 0;
    },
    deleteCartProducts(selectedItemIds) {
      const cartItemIds = [...selectedItemIds];
      this.unselectCartItems(cartItemIds);

      this.deletePpbHapakrCartItems({ cartItemIds })
        .then(() => {})
        .catch(err => {
          console.error(err);
          this.setCustomerSnackbar(`상품을 삭제하지 못했습니다.`);
        });
    },
    toggleSelectAllCartItems() {
      if (this.selectAll) {
        const arr = [];
        _.forEach(this.cart.items, function(val, key) {
          if (!val.disabled) {
            arr.push(key);
          }
        });
        this.selectedCartItemIds = arr;
      } else {
        this.selectedCartItemIds = [];
      }
    },
    unselectCartItems(cartItemIds) {
      _.each(cartItemIds, id => {
        const indexToBeUnselected = this.selectedCartItemIds.indexOf(id);
        if (indexToBeUnselected !== -1) {
          this.selectedCartItemIds.splice(indexToBeUnselected, 1);
        }
      });
    },
    unselectOrderCoupon() {
      this.deletePpbHapakrCartCoupon()
        .then(() => {})
        .catch(err => {
          console.error(`Error! ${err}`);
          this.setCustomerSnackbar(`쿠폰 선택 중 오류가 발생했습니다. ${err}`);
        })
        .finally(() => {
          this.closeDialog();
        });
    },
    changePhoneNumber(e) {
      const value = e.target.value.replace(/[^0-9]/g, '');
      const phoneNumberLength = 11;
      this.customerPhone = this.formatPhone(value);

      this.resetValidationCode();

      if (this.timer) {
        clearTimeout(this.timer);
        this.countDown = 600;
      }

      if (value.length === phoneNumberLength)
        return (this.validationNumber = true);
      return (this.validationNumber = false);
    },
    sentValidationCode() {
      this.validationCode = null;
      this.isValidationFailed = false;
      this.finishCountDown = false;

      if (this.validationNumber) {
        const phone = this.customerPhone.replace(/-/g, '');
        this.postPpbValidations({ phone })
          .then(res => {
            this.validationId = res.data.id;
            if (this.timer) {
              clearTimeout(this.timer);
              this.countDown = 600;
            }
            this.countDownTimer();
          })
          .catch(err => {
            this.showFailedSentValidation = true;
            console.error(err);
          })
          .finally(() => {
            this.hasValidationCode = true;
          });
      }
    },
    checkValidationCode() {
      const { validationId } = this;
      const validCodeLength = 4;
      const code = this.validationCode;

      if (code.length === validCodeLength) {
        this.putPpbValidations({ validationId, code })
          .then(res => {
            if (res.data.status === 'success') {
              this.isValidated = true;
              this.hasValidationCode = false;
              if (this.timer) {
                clearTimeout(this.timer);
                this.countDown = 600;
              }
            } else if (res.data.status === 'fail') {
              this.isValidationFailed = true;
            }
          })
          .catch(err => {
            console.error(err);
            this.isValidationFailed = true;
          });
      }
    },
    createOrder() {
      const selectedCartItemIds = this.selectedCartItemIds;
      const { customerName, customerPhone, savePhone } = this;
      if (this.checkoutCondition) {
        this.isCreatingOrder = true;
        this.putPpbHapakrCartCreatePpbOrder({
          selectedCartItemIds,
          customerName,
          customerPhone,
          savePhone,
        })
          .then(res => {
            setTimeout(() => {
              this.goToPage({
                name: 'CustomerMypageOrder',
                params: { token: res.data.token_customer },
              });
            }, 4500); // fb, ga 등등 기다림
          })
          .catch(err => {
            if (err.response.status === 422) {
              this.refreshCart();
              this.scrollTop();

              this.setCustomerSnackbar(
                `예약 실패: ${err.response.data.message}`
              );
              return;
            }
            this.setCustomerSnackbar(
              `예약에 실패하였습니다. 다시 시도해주세요`
            );
            this.showOrderConfirmDialog = false;
            this.isCreatingOrder = false;
          });
      } else if (!this.selectedCartItemIds.length) {
        this.setCustomerSnackbar('선택된 상품이 없습니다.');
      } else {
        this.setCustomerSnackbar(`예약 정보를 확인해주세요`);
      }
    },
    countDownTimer() {
      if (this.countDown > 0) {
        this.timer = setTimeout(() => {
          this.countDown -= 1;
          this.countDownTimer();
        }, 1000);
      } else {
        this.finishCountDown = true;
      }
    },
    resetValidationCode() {
      this.isValidated = false;
      this.hasValidationCode = false;
      this.validationCode = null;
      this.isValidationFailed = false;
      this.finishCountDown = false;
    },
    // 할인상품일 때 compare_at_price(원가) 존재
    getCompareAtPriceForCart(cartItem) {
      const product = this.getCartProduct(cartItem?.ppb_product_id) || {};
      return this.getCompareAtPrice(product);
    },
    checkCartChanged() {
      if (this.disabledCartItems.length) {
        this.showCartChangedModal = true;
      }
    },
    toggleCouponDialog(toggle) {
      const el = document.body;
      if (toggle) {
        el.classList.add('open-coupon-dialog');
      } else {
        this.cartItem = {};
        el.classList.remove('open-coupon-dialog');
      }
    },
  },
  beforeDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },
  mixins: [ApplicationHelper, CustomerHelper],
  watch: {
    isProductLoaded(val) {
      if (val) {
        this.init();
      }
    },
    cart() {
      //console.log('watch cart', this.cart);
      if (this.hasPickUpFranchise) {
        this.showFranchiseMap = true;
      }
    },
    isSignedIn(val) {
      this.isCustomerSignedIn = val;
    },
    showChangeStore(val) {
      const el = document.body;
      if (val === true) {
        el.classList.add('open-store-dialog');
      } else {
        el.classList.remove('open-store-dialog');
      }
    },
    selectedCartItemIds: {
      handler(val) {
        if (val?.length) {
          const cartItems = this.cart?.items || {};
          const cartItemQuantity = Object.keys(cartItems).length || 0;
          if (cartItemQuantity && val.length === cartItemQuantity) {
            this.selectAll = true;
          }
        }

        const selectedOrderCoupon = _.filter(
          this.myOrderCoupons,
          coupon => coupon.id === this.cart.ppb_coupon_id
        )[0];

        if (
          selectedOrderCoupon &&
          this.sumOfSelectedProductsPrice < selectedOrderCoupon.min_price
        ) {
          this.unselectOrderCoupon();
        }
      },
      deep: true,
    },
    showSelectProductCouponDialog(val) {
      this.toggleCouponDialog(val);
    },
    showSelectOrderCouponDialog(val) {
      this.toggleCouponDialog(val);
    },
  },
};
</script>

<style lang="scss">
.cart-wrap {
  max-width: 780px;
  height: 100%;
  border-left: 1px solid #e8e8e8;
  border-right: 1px solid #e8e8e8;

  .v-card {
    padding: 48px 30px 0;
    max-width: 90%;
  }

  .cart-items-wrap {
    position: relative;
    padding: 0 12px;

    .all-checkbox {
      border-bottom: 1px solid #000;

      .v-input__slot {
        margin: 0 0 10px;

        .v-input--selection-controls__input {
          margin-right: 5px;

          & + label {
            max-width: 80px;
          }
        }
      }

      .v-messages.theme--light {
        display: none;
      }

      label {
        font-size: 12px;
      }
    }

    .v-input--selection-controls__input .v-icon {
      font-size: 22px;
    }

    .v-input--selection-controls__ripple {
      display: none;
    }

    .cart-item {
      padding: 15px 0;
      border-bottom: 1px solid #e8e8e8;

      &:last-of-type {
        padding-bottom: 30px;
      }

      .v-list-item__content {
        align-items: unset;

        .item-actions-row {
          justify-content: space-between;

          .item-checkbox {
            flex: 0 0 6%;
            max-width: 6%;
          }

          .btn-item-delete {
            text-align: right;

            .v-btn {
              .v-icon {
                font-size: 15px;
              }

              &:before {
                content: none;
              }

              .v-ripple__container {
                display: none;
              }
            }
          }
        }

        .item-info-row {
          width: 100%;

          .item-thumb {
            flex: 0 0 30%;
            max-width: 30%;
          }

          .item-description {
            position: relative;
            flex: 0 0 70%;
            max-width: 70%;

            .item-title {
              max-width: 85%;
              min-height: 20px;
              font-size: 15px !important;
              margin-bottom: 4px;
            }

            .item-price {
              font-size: 14px;
              margin: 4px 0 15px;

              span {
                padding-bottom: 4px;
              }
            }

            .item-power,
            .item-count {
              display: flex;
              font-size: 13px;

              span {
                line-height: 30px;
              }
            }

            .item-count {
              .item-count-inner {
                max-width: 80px;
                width: 100%;
              }

              .v-btn {
                background-color: #fff;
                box-shadow: none;
                padding: 0 10px;
                width: 20px;
                height: 30px;
                min-width: auto;
                border: 1px solid #e8e8e8;
                border-radius: 0;

                .v-icon {
                  font-size: 13px !important;
                }

                &.v-btn--disabled {
                  background-color: #fff !important;
                }
              }

              .v-input {
                font-size: 13px;
                border-top: 1px solid #e8e8e8;
                border-bottom: 1px solid #e8e8e8;
                height: 30px;
                line-height: 30px;
                box-sizing: border-box;
                overflow: hidden;

                .v-input__slot {
                  margin: 0;
                }

                .v-text-field__details {
                  display: none;
                }

                input {
                  text-align: center;
                }
              }
            }

            .item-power {
              position: relative;
              width: 100px;
              cursor: pointer;

              .mdi-chevron-down {
                position: absolute;
                right: 0;
                font-size: 30px;
                transform: scale(0.8);
                z-index: 0;
              }

              .item-power-select {
                //max-width: 80px;
                width: 100%;
                height: 30px;
                font-size: 13px;
                border: 1px solid #e8e8e8;
                border-radius: 0;
                outline: none;
                padding-left: 10px;
                box-sizing: border-box;
                cursor: pointer;
                color: #000000;
                z-index: 0;
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
              }
            }

            .item-total-price {
              margin: 0;
              padding-right: 6px;
              width: 100%;
              text-align: right;
              font-size: 15px;
              line-height: 33px;

              .v-skeleton-loader__text {
                margin: 6px 0;
                width: 80%;
                max-width: 90px;
                height: 16px;
                float: right;
              }
            }
          }
        }
      }
    }
    .item-coupon {
      > div {
        color: #afafaf;
        cursor: pointer;
        padding: 10px 5px;
        max-width: 80%;
        height: 40px;
        border: 1px solid #e8e8e8;
        text-align: center;

        &:not(.has-coupon) {
          .v-icon {
            color: #afafaf;
          }
        }
      }

      &.has-coupon {
        > div {
          color: #000;

          .v-icon {
            color: rgba(0, 0, 0, 0.54);
          }

          span {
            position: relative;

            &:after {
              position: absolute;
              top: -4px;
              right: -4px;
              content: '';
              width: 5px;
              height: 5px;
              border-radius: 50%;
              background: #ff7092;
            }
          }
        }

        &.has-selected-coupon {
          > div {
            border: 1px solid #ff7092;

            span {
              color: #ff7092;

              &:after {
                display: none;
              }
            }

            .v-icon {
              color: #ff7092;
            }
          }
        }
      }
    }

    section.order-coupon-section {
      .row {
        padding: 10px 5px;
      }
      .order-coupon {
        > div {
          color: #afafaf;
          cursor: pointer;
          padding: 10px 5px;
          max-width: 80%;
          height: 40px;
          border: 1px solid #e8e8e8;
          text-align: center;

          &:not(.has-coupon) {
            .v-icon {
              color: #afafaf;
            }
          }

          &.has-coupon {
            > div {
              color: #000;

              .v-icon {
                color: rgba(0, 0, 0, 0.54);
              }

              span {
                position: relative;

                &:after {
                  position: absolute;
                  top: -4px;
                  right: -4px;
                  content: '';
                  width: 5px;
                  height: 5px;
                  border-radius: 50%;
                  background: #ff7092;
                }
              }
            }

            &.has-selected-coupon {
              border: 1px solid #ff7092;

              span {
                color: #ff7092;

                &:after {
                  display: none;
                }
              }

              .v-icon {
                color: #ff7092;
              }
            }
          }
        }
      }
    }

    .cart-gift {
      padding: 20px 0;
      border-bottom: 1px solid #e8e8e8;

      .gift-image-wrap {
        flex: 0 0 30%;
        max-width: 30%;
      }

      .gift-text-wrap {
        max-width: 70%;

        .subtitle-1 {
          font-size: 14px !important;
          line-height: 1.5;
        }

        .item-count {
          max-width: 150px;
          font-size: 12px;

          .v-btn.v-btn--disabled {
            background-color: #fff !important;
            box-shadow: none;
            padding: 0 10px;
            width: 20px;
            height: 30px;
            min-width: auto;
            border: 1px solid #e8e8e8;
            border-radius: 0;
          }

          .v-input {
            font-size: 12px;
            border-top: 1px solid #e8e8e8;
            border-bottom: 1px solid #e8e8e8;
            height: 30px;
            line-height: 30px;
            box-sizing: border-box;
            overflow: hidden;
            text-align: center !important;
          }

          .free-gift {
            margin: 0;
            text-align: center !important;
            color: #000;
            font-size: 11px;

            .v-label {
              font-size: 13px;
              top: 5px;
            }
          }

          p {
            width: 35px !important;
            margin-bottom: 8px;
            margin-top: 4px;
          }

          .item-count-inner {
            width: 50%;

            .theme--light.v-btn.v-btn--disabled .v-icon {
              font-size: 11px !important;
              text-align: center;
            }
          }
        }
      }
    }

    .cart-price-wrap {
      margin: 0;
      padding: 10px 5px;
      border-bottom: 1px solid #000;

      p {
        margin: 0 0 2px 0;
        font-size: 14px;
        color: #000;
        overflow: hidden;

        span {
          float: right;
          line-height: 2;

          &.discount {
            color: #ff7092;
          }
        }

        &.cart-total-price {
          margin-top: 10px;
          font-size: 17px;

          span {
            font-size: 17px;
            color: #ff7092;
          }
        }
      }
    }
  }

  .btn-selected-delete {
    .v-btn {
      background-color: transparent !important;
      box-shadow: none;
      font-size: 12px;
    }
  }

  .customer-info-wrap {
    .customer-input {
      margin: 10px 0 0;

      label {
        font-size: 13px;
        width: 70px;
        color: #999999;
        line-height: 35px;
        display: inline-block;
      }

      input {
        border: 1px solid #e8e8e8;
        height: 35px;
        padding: 0 10px;
        max-width: 300px;
        width: calc(100% - 70px);
        font-size: 15px;
        color: #000;
        line-height: normal;

        &::placeholder {
          font-size: 13px;
        }

        &.customer-phone {
          max-width: 220px;
          width: calc(100% - 150px);
        }

        &.validation-code {
          max-width: 160px;
          width: calc(100% - 210px);
          vertical-align: top;
        }
      }

      &:active,
      :focus {
        outline: none;
      }

      .validation-code-input-wrap {
        max-width: 220px;
        width: calc(100% - 150px);
        font-size: 15px;
        border: 1px solid #e8e8e8;
        display: inline-flex;
        box-sizing: border-box;

        input {
          border: 0;
          width: 100%;
        }

        .countdown {
          color: #d32f2f;
          font-size: 13px;
          width: auto;
          min-width: 55px;
          text-align: right;
          line-height: 35px;
          padding-right: 10px;
        }
      }
    }

    .btn-check-number {
      font-size: 13px;
      border: 1px solid #e8e8e8;
      border-radius: 0;
      height: 35px;
      min-width: auto;
      padding: 0 10px;
      background: #fff;
      font-weight: 500;
      width: 80px;
      text-align: center;
      border-left: 0;
      box-sizing: border-box;

      &.active {
        border: 1px solid #000;
        background-color: #000;
        color: #fff;
      }
    }

    .btn-check-code {
      font-size: 13px;
      background: #e8e8e8;
      border-radius: 0;
      height: 35px;
      min-width: auto;
      padding: 0 10px;
      font-weight: 500;
      width: 60px;
      text-align: center;
      border-left: 0;
      box-sizing: border-box;
    }

    .validation-code-info {
      margin: 5px 0 0 70px;
      font-size: 12px;
      color: #000;

      p {
        margin: 0;
      }

      span {
        color: #d32f2f;

        &.countdown {
          color: #d32f2f;
        }

        &.sub-txt {
          display: block;
          margin-left: 18px;
        }
      }

      .validation-fail {
        color: #d32f2f;
        box-sizing: border-box;
        margin-bottom: 4px;
        font-size: 11px;

        .v-icon {
          font-size: 15px;
          color: #d32f2f;
          margin-top: -2px;
        }
      }
    }

    .validation-code-failed {
      margin: 3px 0 0;

      .validation-code-info {
        color: #e11833;
      }
    }

    .validation-success {
      margin: 3px 0 0;

      .v-icon {
        font-size: 15px;
        color: #000;
        margin-top: -2px;
      }
    }

    .cart-box-save-phone {
      margin: 5px 0 0 70px;

      .v-input {
        margin: 0;
        padding: 0;

        .v-input__slot {
          margin: 0;
        }

        .v-input--selection-controls__input {
          margin: -2px 2px 0 -4px;
        }

        .v-icon {
          font-size: 22px;
        }

        label {
          font-size: 13px;
        }

        .v-input--selection-controls__ripple {
          display: none;
        }

        .v-messages {
          display: none;
        }
      }
    }

    .cart-box-term {
      margin-top: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #efefef;

      .term-title {
        margin: 8px 0;
      }

      .term-wrap {
        border: 1px solid #e8e8e8;
        padding: 0 10px 7px;
        margin-bottom: 8px;
        line-height: 1.5;
        font-size: 11px;

        &:last-child {
          border: none;
        }

        .v-input {
          margin: 0;
          padding: 0 0 5px 0;
          border: none;

          .v-label {
            font-size: 13px;
          }

          .v-input__slot {
            margin: 0;
          }

          .v-messages {
            display: none;
          }
        }

        .term {
          margin: 10px 3px 5px;
          padding: 10px;
          max-height: 100px;
          overflow-y: scroll;
          font-size: 12px;
        }
      }

      .term-check-box {
        margin-top: 0 !important;

        .v-label {
          font-size: 15px;
        }
      }

      .term-wrap + .v-input {
        .v-label {
          font-size: 13px;
        }
      }

      .v-messages.theme--light {
        display: none;
      }
    }
  }

  .login-request-wrap {
    border-bottom: 1px solid #e8e8e8;
    padding-bottom: 25px;
    margin-bottom: 20px;

    p {
      font-size: 13px;
      margin: 0;
    }

    .btn-login {
      width: 100%;
      display: block;
      text-align: center;
      margin-top: 15px;
      height: 40px;
      line-height: 40px;
      border: 1px solid #000;
      border-radius: 30px;
      text-decoration: none;
      font-size: 13px;
    }
  }

  .cart-box-wrap {
    padding: 20px 15px;

    .row {
      &:last-child {
        padding-bottom: 20px;
        border-bottom: 1px solid #efefef;
      }
    }

    &.cart-pickup-store {
      padding: 0 15px !important;
    }

    .cart-box-title {
      font-size: 15px;
      color: #000;
      font-weight: 600;
    }

    .store-info {
      position: relative;

      .store-name {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 5px;
        color: #000;
        display: inline-block;

        .v-icon {
          position: relative;
          top: -1px;
          margin-right: 1px;
        }
      }

      .store-address,
      .store-phone {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 5px;
      }

      .btn-change-store {
        position: absolute;
        top: 0;
        right: 0;
        min-width: auto;
        height: auto;
        font-size: 13px;
        background: transparent !important;
        box-shadow: none;
        text-decoration: underline;
        padding: 0;
      }

      .store-favorite {
        left: 15px;
        top: -10px;

        .v-icon {
          font-size: 14px;
        }
      }
    }

    .franchise-select-wrap {
      p {
        font-size: 13px;
        margin: 0;
      }

      .v-btn {
        width: 100%;
        display: block;
        text-align: center;
        margin-top: 15px;
        height: 56px;
        line-height: 56px;
        border: 1px solid #000;
        border-radius: 10px;
        text-decoration: none;
        font-size: 15px;
        letter-spacing: -0.5px;
      }
    }
  }

  .store-map {
    position: relative;
    margin-top: 10px;

    #map {
      border: 1px solid #dfdfdf;
      z-index: 1;

      .custom-overlay {
        display: none;
      }
    }

    .map-cover {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: transparent;
      z-index: 8;
    }

    .btn-save-favorite-franchise {
      position: absolute;
      right: 7px;
      top: 8px;
      z-index: 9;
      background: #333333;
      height: auto;
      padding: 3px 7px 5px;
      margin-left: 8px;
      color: #ffffff;
      border-radius: 4px;

      .v-icon {
        font-size: 16px;
        position: relative;
        top: 1px;
        margin-right: 3px;
      }

      &.active {
        background: #ff7092;
      }
    }
  }

  .cart-action {
    width: 100%;
    padding: 0 15px;
    margin-bottom: 70px;

    .btn-checkout {
      width: 100%;
      background: #eee !important;
      border: 1px solid #eee;
      color: #afafaf;
      border-radius: 10px;
      box-shadow: none;
      height: 56px;
      line-height: 56px;
      font-size: 15px;
      letter-spacing: 0;
      cursor: not-allowed;
      font-weight: 600;
    }

    &.active {
      .btn-checkout {
        background-color: #000 !important;
        color: #fff;
        cursor: pointer;
      }
    }
  }

  .cart-empty {
    font-size: 15px;
    text-align: center;
    padding: 100px 0;
  }
}

.change-modal-title {
  border-bottom: 1px solid #eaeaea;
  line-height: 1;
  padding: 16px 0 !important;
  transition: all 0.3s ease-in-out;

  .btn-close {
    position: absolute;
    top: 10px;
    left: 20px;
  }

  p {
    margin: 0;
    font-size: 1rem;
  }
}

.store-change-modal {
  &.store-wrap {
    background-color: #ffffff;
    margin: 0;
    border-top: 0;
    max-width: 100%;

    .store-map-wrap {
      .store-list {
        bottom: 0;
      }
    }
  }
}

.v-dialog__content {
  transition: none;

  .v-dialog {
    &.v-dialog--fullscreen {
      transition: none;
    }
  }
}

.open-store-dialog {
  .store-change-modal-wrap {
    width: 100%;
    max-width: 780px;
    height: 100%;
    background-color: #fff;
    padding: 0;

    .change-modal-title {
      position: fixed;
      top: 0;
      max-width: 780px;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      z-index: 9;
      background: #fff;
    }

    .v-tabs {
      position: fixed;
      top: 49px;
      z-index: 9;
      max-width: 780px;
      left: 50%;
      transform: translateX(-50%);
      transition: all 0.3s ease-in-out;
    }

    .v-card {
      border-radius: 0;
      box-shadow: none;

      &.store-list {
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
      }

      .v-tabs-items {
        margin-top: 97px !important;

        .store-search-wrap {
          padding-top: 1px;
        }

        .all-store-map {
          margin-top: 20px;
        }
      }
    }
  }

  .v-dialog__content {
    .v-dialog {
      &.v-dialog--fullscreen {
        box-shadow: none;
        background: rgb(0 0 0 / 30%);
      }
    }
  }
}

.open-coupon-dialog {
  .v-dialog__content.v-dialog__content--active {
    background: rgba(0, 0, 0, 0.3);
    z-index: 204 !important;

    .v-dialog {
      .product-coupon-card,
      .order-coupon-card {
        .v-card__title {
          .v-btn {
            &:before {
              display: none;
            }
          }
        }

        .option {
          position: relative;
          cursor: pointer;

          &.disabled {
            pointer-events: none;
            opacity: 1;
          }

          &.default-option {
            margin-bottom: 15px;
            padding: 10px 20px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;

            p {
              font-size: 16px;
            }
          }

          .coupon {
            padding: 15px 20px;
          }
        }
      }
    }
  }
}

.cart-confirm-dialog {
  .v-card__text {
    p {
      font-size: 13px;

      span.title {
        display: inline-block;
        width: 60px;
        font-size: 13px !important;
        line-height: 1.8;
      }

      span.cart-product {
        width: calc(100% - 60px);

        > span {
          &.cart-product-title {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }

          &.cart-product-count {
            width: 60px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 960px) {
  .cart-wrap {
    > div {
      padding: 40px 6px 0 !important;
    }

    .v-card {
      max-width: 100%;
    }

    .cart-items-wrap {
      .cart-item {
        padding: 12px 0 15px;

        .item-actions-row {
          .item-checkbox {
            display: flex;
            align-items: flex-end;

            .disabled-reason {
              font-size: 11px;
            }
          }

          .btn-item-delete {
            position: relative;
            right: -10px;
          }
        }

        .v-list-item__content {
          .item-info-row {
            .item-description {
              padding-left: 10px;
              flex: 0 0 calc(70%);
              max-width: calc(70%);

              .item-power {
                max-width: 150px;
                width: 50%;

                .item-power-select {
                  max-width: 100%;
                  box-sizing: content-box;
                }
              }

              .item-count {
                max-width: 150px;
                width: 50%;
                font-size: 12px;

                .item-count-inner {
                  max-width: 100%;
                }
              }

              .item-coupon {
                cursor: pointer;

                > div {
                  max-width: 300px;
                  width: 100%;
                }
              }

              .item-total-price {
                max-width: 120px;
                position: absolute;
                right: 0;
                bottom: 0;
                font-size: 14px;
              }
            }
          }
        }
      }

      .cart-price-wrap {
        p.cart-total-price {
          font-size: 15px;
        }
      }
    }
  }
  .open-store-dialog {
    .v-dialog__content {
      transition: 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);

      .v-dialog {
        &.v-dialog--fullscreen {
          top: 34px;
          transition: inherit;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;

          .container {
            width: 100%;
            float: none;
            max-width: 100%;

            &.store-locator-wrap {
              top: 145px;
            }

            &.store-change-modal-wrap {
              height: 100vh;
              background-color: #ffffff;

              .change-modal-title {
                top: 34px;
                border-top-right-radius: 15px;
                border-top-left-radius: 15px;
              }

              .v-tabs {
                top: 83px;
                max-width: 100%;
                transform: none;
                left: auto;
              }

              .v-card {
                box-shadow: none;
                padding-bottom: 3px !important;

                &.store-list {
                  bottom: 0;
                }

                .v-tabs-items {
                  margin-top: 120px;

                  .all-store-map {
                    margin-top: 12px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  .open-coupon-dialog {
    .v-dialog__content {
      .v-dialog {
        padding-top: 50vh;
        transition: inherit;

        .product-coupon-card,
        .order-coupon-card {
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;

          .v-card__title {
            font-size: 17px;
          }

          .v-card__text {
            .option {
              &.default-option {
                padding: 10px 15px;

                p {
                  font-size: 14px;
                }

                .v-icon {
                  font-size: 32px;
                }
              }
            }

            .coupon {
              padding: 10px 15px;

              p {
                font-size: 12px;

                &:nth-child(1) {
                  font-size: 16px;
                }

                &:nth-child(2) {
                  font-size: 13px;
                }

                &:nth-child(3) {
                  font-size: 11px;
                }
              }

              .v-icon {
                font-size: 32px;
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 320px) {
  .cart-wrap {
    .cart-items-wrap {
      .cart-item {
        .v-list-item__content {
          .item-info-row {
            .item-description {
              flex: 0 0 calc(70%);
              max-width: calc(70%);

              .item-count {
                .v-progress-circular {
                  width: 12px !important;
                }
              }

              .item-total-price {
                max-width: 80px;

                span {
                  font-size: 13px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
