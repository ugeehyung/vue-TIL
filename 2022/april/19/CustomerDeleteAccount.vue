<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="290"
    >
      <template v-slot:activator="{ on, attrs }" style="text-align: center">
        <v-btn
          color="pink"
          dark
          v-bind="attrs"
          v-on="on"
        >
          회원탈퇴
        </v-btn>
      </template>
      <v-card>
        <v-card-title
          style="font-size: 14px"
        >
          회원 탈퇴를 진행하시겠습니까?
        </v-card-title>
        <v-card-text></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="pink darken-1"
            text
            @click="okButton"
          >
            확인
          </v-btn>
          <v-btn
            color="pink darken-1"
            text
            @click="dialog = false"
          >
            취소
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import {call} from "vuex-pathify";
export default {

  data () {
    return {
      dialog: false,
      showDialog: false,
    }
  },
  name: 'CustomerDeleteAccount',
  methods: {
    ...call('hapakr', ['postWithdraw']),
    okButton() {
      this.postWithdraw();
    }
  }
}

</script>

<style scoped></style>