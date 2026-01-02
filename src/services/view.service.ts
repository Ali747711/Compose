import { ViewInput, View } from "./../libs/types/view";
import ViewModel from "../schemas/view.schema";
import Errors, { HttpCode, Message } from "../libs/Errors";

class ViewService {
  private readonly viewModel;

  constructor() {
    this.viewModel = ViewModel;
  }

  public checkViewExist = async (input: ViewInput): Promise<View> => {
    return (await this.viewModel
      .findOne({ userId: input.userId, viewRefId: input.viewRefId })
      .exec()) as View;
  };

  public insertViewExist = async (input: ViewInput): Promise<View> => {
    try {
      return await this.viewModel.create(input);
    } catch (error) {
      console.log("View service, [insertViewExist] Error: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  };
}

export default ViewService;
