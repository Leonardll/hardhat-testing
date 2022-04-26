import { expect } from "chai";
import { assert } from "console";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
export const shouldDeposit = (): void => {
  //   // to silent warning for duplicate definition of Transfer event
  //   ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.OFF);

  context(`#deposit`, async function () {
    it(`should revert if token amount is not greater to 0...`, async function () {
      const amount = ethers.constants.Zero;

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      ).to.be.revertedWith(`NeedsMoreThanZero`);
    });
    it(`should emit proper event`, async function () {
      const amount: BigNumber = ethers.constants.One;

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      )
        .to.emit(this.lending, `Deposit`)
        .withArgs(
          this.signers.alice.address,
          this.mocks.mockUsdc.address,
          amount
        );
    });
    it(`should update storage variable properly`, async function () {
      const previousAccountToTokenDeposits: BigNumber =
        await this.lending.s_accountToTokenDeposits(
          this.signers.alice.address,
          this.mocks.mockUsdc.address
        );

      const amount: BigNumber = parseEther(`1`);
      await this.lending
        .connect(this.signers.alice)
        .deposit(this.mocks.mockUsdc.address, amount);

      const currentToTokenDeposits: BigNumber =
        await this.lending.s_accountToTokenDeposits(
          this.signers.alice.address,
          this.mocks.mockUsdc.address
        );
      console.log(currentToTokenDeposits);

      assert(
        currentToTokenDeposits.toBigInt() ===
          previousAccountToTokenDeposits.add(amount).toBigInt(),
        `New value should equal previous plus amount `
      );
    });
    it(`should revert with TransferFailed error`, async function () {
      await this.mocks.mockUsdc.mock.transferFrom.returns(false);

      const amount: BigNumber = parseEther(`1`);

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      ).to.be.revertedWith(`TransferFailed`);
    });
  });
};
